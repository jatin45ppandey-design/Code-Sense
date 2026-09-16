package jatin.backend.Service.github.indexing;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jatin.backend.Entity.IndexStatus;
import jatin.backend.Entity.Repository;
import jatin.backend.Exceptions.BadReqException;
import jatin.backend.Exceptions.ExternalServiceException;
import jatin.backend.Exceptions.NotFoundException;
import jatin.backend.Repo.RepositoryRepo;
import jatin.backend.Service.UserService;
import jatin.backend.Service.ai.RagSettings;
import jatin.backend.Service.github.GitHubRateLimiter;
import jatin.backend.Service.github.GithubApiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class IndexingService {
    private static final int VECTOR_BATCH_SIZE = 32;
    private static final int PROGRESS_EVERY_N_FILES = 5;

    private final RepositoryRepo repositoryRepository;
    private final UserService userService;
    private final GithubApiClient gitHubApiClient;
    private final CodeFileFilter fileFilter;
    private final CodeChunker codeChunker;
    private final GitHubRateLimiter rateLimiter;
    private final VectorStore vectorStore;

    @Value("${app.indexing.max-file-bytes:102400}")
    private long maxFileBytes;

    @Value("${app.indexing.max-chunks:5000}")
    private int maxChunks;

    @Transactional
    public Repository startIndexing(UUID repoId, UUID userId) {
        Repository repo = repositoryRepository.findForIndexing(repoId, userId)
                .orElseThrow(() -> new NotFoundException("Repository not found"));

        if (repo.getIndexStatus() == IndexStatus.INDEXING) {
            throw new BadReqException("Repository is already being indexed");
        }

        repo.setIndexStatus(IndexStatus.INDEXING);
        repo.setFilesProcessed(0);
        repo.setFilesTotal(0);
        repo.setChunkCount(0);
        repo.setIndexedAt(null);
        repo.setErrorMessage(null);
        return repositoryRepository.save(repo);
    }

    @Async("indexingExecutor")
    public void indexAsync(UUID repoId, UUID userId) {
        try {
            doIndex(repoId, userId);
        } catch (Exception exception) {
            String safeMessage = safeFailureMessage(exception);
            log.error("Indexing failed for repository {}: {} ({})",
                    repoId, safeMessage, exception.getClass().getSimpleName());
            markFailed(repoId, userId, safeMessage);
        }
    }

    void doIndex(UUID repoId, UUID userId) {
        Repository repo = repositoryRepository.findByIdAndUserId(repoId, userId)
                .orElseThrow(() -> new NotFoundException("Repository not found"));
        String token = userService.decryptaccessToken(userService.reqById(userId));
        String commitSha = gitHubApiClient.getCommitSha(
                token, repo.getOwner(), repo.getName(), repo.getDefaultBranch());

        Map<String, Object> tree = gitHubApiClient.getRepoTree(
                token, repo.getOwner(), repo.getName(), commitSha);
        List<String> filePaths = listIndexableFiles(tree);
        if (filePaths.isEmpty()) {
            throw new BadReqException("Repository contains no supported source files");
        }

        updateProgress(repoId, userId, filePaths.size(), 0, 0, IndexStatus.INDEXING, null);

        List<Document> documents = new ArrayList<>();
        int processed = 0;
        for (String path : filePaths) {
            try {
                String content = gitHubApiClient.getFileContent(
                        token, repo.getOwner(), repo.getName(), path, commitSha);
                documents.addAll(codeChunker.chunkFile(
                        repoId.toString(),
                        repo.getOwner(),
                        repo.getName(),
                        repo.getDefaultBranch(),
                        path,
                        content));
                if (documents.size() > maxChunks) {
                    throw new BadReqException(
                            "Repository exceeds the configured indexing chunk limit of " + maxChunks);
                }
                processed++;
            } catch (Exception exception) {
                updateProgress(repoId, userId, filePaths.size(), processed,
                        documents.size(), IndexStatus.INDEXING, null);
                throw exception;
            }

            if (processed % PROGRESS_EVERY_N_FILES == 0 || processed == filePaths.size()) {
                updateProgress(repoId, userId, filePaths.size(), processed,
                        documents.size(), IndexStatus.INDEXING, null);
            }
            rateLimiter.pause();
        }

        if (documents.isEmpty()) {
            throw new BadReqException("Repository contains no indexable text content");
        }

        boolean replacementStarted = false;
        try {
            deleteVectors(repoId.toString());
            replacementStarted = true;
            addInBatches(documents);
        } catch (Exception exception) {
            if (replacementStarted) {
                cleanupPartialVectors(repoId.toString());
            }
            throw exception;
        }

        markReady(repoId, userId, filePaths.size(), processed, documents.size(), repo.getFullName(), commitSha);
    }

    @SuppressWarnings("unchecked")
    private List<String> listIndexableFiles(Map<String, Object> tree) {
        if (tree == null || !(tree.get("tree") instanceof List<?>)) {
            throw new ExternalServiceException(
                    org.springframework.http.HttpStatus.BAD_GATEWAY,
                    "GitHub returned an invalid repository tree",
                    new IllegalStateException("Missing tree data"));
        }
        if (Boolean.TRUE.equals(tree.get("truncated"))) {
            throw new BadReqException("GitHub repository tree is too large to index completely");
        }

        List<Map<String, Object>> entries = (List<Map<String, Object>>) tree.get("tree");
        return entries.stream()
                .filter(entry -> "blob".equals(String.valueOf(entry.get("type"))))
                .filter(entry -> {
                    String path = String.valueOf(entry.get("path"));
                    long size = entry.get("size") instanceof Number number ? number.longValue() : 0L;
                    return fileFilter.isEligible(path, size, maxFileBytes);
                })
                .map(entry -> String.valueOf(entry.get("path")))
                .toList();
    }

    private void addInBatches(List<Document> documents) {
        for (int start = 0; start < documents.size(); start += VECTOR_BATCH_SIZE) {
            int end = Math.min(start + VECTOR_BATCH_SIZE, documents.size());
            vectorStore.add(new ArrayList<>(documents.subList(start, end)));
        }
    }

    private void deleteVectors(String repositoryId) {
        var filter = new FilterExpressionBuilder()
                .eq(RagSettings.METADATA_REPOSITORY_ID, repositoryId)
                .build();
        vectorStore.delete(filter);
    }

    private void cleanupPartialVectors(String repositoryId) {
        try {
            deleteVectors(repositoryId);
        } catch (Exception cleanupError) {
            log.error("Could not clean partial vectors for repository {} ({})",
                    repositoryId, cleanupError.getClass().getSimpleName());
        }
    }

    private void updateProgress(
            UUID repoId,
            UUID userId,
            int total,
            int processed,
            int chunks,
            IndexStatus status,
            String error) {
        repositoryRepository.findByIdAndUserId(repoId, userId).ifPresent(repo -> {
            repo.setFilesTotal(total);
            repo.setFilesProcessed(processed);
            repo.setChunkCount(chunks);
            repo.setIndexStatus(status);
            repo.setErrorMessage(error);
            repositoryRepository.save(repo);
        });
    }

    private void markReady(
            UUID repoId,
            UUID userId,
            int totalFiles,
            int processedFiles,
            int totalChunks,
            String fullName,
            String commitSha) {
        repositoryRepository.findByIdAndUserId(repoId, userId).ifPresent(repo -> {
            repo.setIndexStatus(IndexStatus.READY);
            repo.setFilesTotal(totalFiles);
            repo.setFilesProcessed(processedFiles);
            repo.setChunkCount(totalChunks);
            repo.setIndexedAt(Instant.now());
            repo.setIndexedCommitSha(commitSha);
            repo.setErrorMessage(null);
            repositoryRepository.save(repo);
        });
        log.info("Indexed {} files ({} chunks) for {}", processedFiles, totalChunks, fullName);
    }

    public void markFailedToSchedule(UUID repoId, UUID userId) {
        markFailed(repoId, userId, "Indexing queue is full; try again later");
    }

    private void markFailed(UUID repoId, UUID userId, String message) {
        repositoryRepository.findByIdAndUserId(repoId, userId).ifPresent(repo -> {
            repo.setIndexStatus(IndexStatus.FAILED);
            repo.setChunkCount(0);
            repo.setIndexedAt(null);
            repo.setErrorMessage(limit(message, 500));
            repositoryRepository.save(repo);
        });
    }

    private static String safeFailureMessage(Exception exception) {
        if (exception instanceof BadReqException
                || exception instanceof NotFoundException
                || exception instanceof ExternalServiceException) {
            return limit(exception.getMessage(), 500);
        }

        String message = exception.getMessage();
        String normalized = message == null ? "" : message.toLowerCase(Locale.ROOT);
        if (normalized.contains("401") || normalized.contains("api key")
                || normalized.contains("unauthorized")) {
            return "AI provider authentication failed";
        }
        if (normalized.contains("429") || normalized.contains("rate limit")
                || normalized.contains("quota")) {
            return "AI provider rate limit or quota exceeded";
        }
        if (normalized.contains("model") && normalized.contains("not found")) {
            return "Configured AI model is unavailable";
        }
        if (normalized.contains("connect") || normalized.contains("timeout")
                || normalized.contains("unavailable")) {
            return "AI or repository provider is unavailable";
        }
        return "Repository indexing failed";
    }

    private static String limit(String message, int maxLength) {
        if (message == null || message.isBlank()) {
            return "Repository indexing failed";
        }
        return message.length() <= maxLength ? message : message.substring(0, maxLength);
    }
}
