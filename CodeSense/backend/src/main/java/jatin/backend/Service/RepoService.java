package jatin.backend.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jatin.backend.DTO.IndexStatusResponse;
import jatin.backend.DTO.RepositoryResponse;
import jatin.backend.Entity.Repository;
import jatin.backend.Entity.User;
import jatin.backend.Exceptions.BadReqException;
import jatin.backend.Exceptions.NotFoundException;
import jatin.backend.Repo.RepositoryRepo;
import jatin.backend.Service.github.GithubApiClient;
import jatin.backend.Service.github.GitHubRepositoryUrlParser;
import lombok.RequiredArgsConstructor;

/** Synchronizes a user's GitHub repositories and exposes persisted repository data. */
@Service
@RequiredArgsConstructor
public class RepoService {

    private final RepositoryRepo repositoryRepo;
    private final UserService userService;
    private final GithubApiClient githubApiClient;
    private final GitHubRepositoryUrlParser repositoryUrlParser;

    /** Fetches the latest GitHub repositories, upserts them, and returns the stored list. */
    public List<RepositoryResponse> syncAndListRepos(UUID userId) {
        User user = userService.reqById(userId);
        String accessToken = userService.decryptaccessToken(user);
        List<Map<String, Object>> remoteRepositories = githubApiClient.listUserRepos(accessToken);
        List<Repository> repositories = new ArrayList<>(remoteRepositories.size());

        for (Map<String, Object> remote : remoteRepositories) {
            repositories.add(applyGithubMetadata(userId, remote));
        }

        repositoryRepo.saveAll(repositories);
        return listStored(userId);
    }

    /** Imports only repositories that GitHub authorizes for the current OAuth token. */
    @Transactional
    public RepositoryResponse importFromUrl(UUID userId, String url) {
        GitHubRepositoryUrlParser.RepositoryAddress address = repositoryUrlParser.parse(url);
        User user = userService.reqById(userId);
        Map<String, Object> remote = githubApiClient.getRepository(
                userService.decryptaccessToken(user), address.owner(), address.repository());
        return toResponse(repositoryRepo.save(applyGithubMetadata(userId, remote)));
    }

    @Transactional(readOnly = true)
    public List<RepositoryResponse> listStored(UUID userId) {
        return repositoryRepo.findByUserIdOrderByFullNameAsc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Repository requireOwned(UUID repoId, UUID userId) {
        return repositoryRepo.findByIdAndUserId(repoId, userId)
                .orElseThrow(() -> new NotFoundException("Repository not found"));
    }

    @Transactional(readOnly = true)
    public IndexStatusResponse status(UUID repoId, UUID userId) {
        Repository repository = requireOwned(repoId, userId);
        return new IndexStatusResponse(
                repository.getId(),
                repository.getIndexStatus(),
                repository.getFilesTotal(),
                repository.getFilesProcessed(),
                repository.getChunkCount(),
                repository.getIndexedAt(),
                repository.getErrorMessage());
    }

    public RepositoryResponse toResponse(Repository repository) {
        return new RepositoryResponse(
                repository.getId(),
                repository.getGithubRepoId(),
                repository.getOwner(),
                repository.getName(),
                repository.getFullName(),
                repository.isPrivate(),
                repository.getDefaultBranch(),
                repository.getLanguage(),
                repository.getHtmlUrl(),
                repository.getDescription(),
                repository.getIndexStatus(),
                repository.getIndexedAt(),
                repository.getIndexedCommitSha(),
                repository.getChunkCount(),
                repository.getFilesTotal(),
                repository.getFilesProcessed(),
                repository.getErrorMessage());
    }

    private Repository applyGithubMetadata(UUID userId, Map<String, Object> remote) {
        long githubRepoId = requiredLong(remote.get("id"), "GitHub repository id is missing or invalid");
        Repository repository = repositoryRepo.findByUserIdAndGithubRepoId(userId, githubRepoId)
                .orElseGet(Repository::new);
        String name = requiredText(remote.get("name"), "GitHub repository name is missing");
        String owner = extractOwner(remote.get("owner"));
        String fullName = optionalText(remote.get("full_name"), owner + "/" + name);
        if (owner.isBlank() && fullName.contains("/")) {
            owner = fullName.substring(0, fullName.indexOf('/'));
        }
        if (owner.isBlank()) {
            throw new BadReqException("GitHub repository owner is missing");
        }
        repository.setUserId(userId);
        repository.setGithubRepoId(githubRepoId);
        repository.setOwner(owner);
        repository.setName(name);
        repository.setFullName(fullName);
        repository.setPrivate(Boolean.TRUE.equals(remote.get("private")));
        repository.setDefaultBranch(optionalText(remote.get("default_branch"), "main"));
        repository.setLanguage(nullableText(remote.get("language")));
        repository.setHtmlUrl(nullableText(remote.get("html_url")));
        repository.setDescription(nullableText(remote.get("description")));
        repository.setUpdatedAt(Instant.now());
        return repository;
    }

    private static String extractOwner(Object value) {
        if (value instanceof Map<?, ?> owner && owner.get("login") != null) {
            return String.valueOf(owner.get("login")).trim();
        }
        String owner = nullableText(value);
        return owner == null ? "" : owner;
    }

    private static String requiredText(Object value, String message) {
        String text = nullableText(value);
        if (text == null || text.isBlank()) {
            throw new BadReqException(message);
        }
        return text;
    }

    private static String optionalText(Object value, String fallback) {
        String text = nullableText(value);
        return text == null || text.isBlank() ? fallback : text;
    }

    private static String nullableText(Object value) {
        if (value == null) {
            return null;
        }
        String text = String.valueOf(value).trim();
        return text.isEmpty() ? null : text;
    }

    private static long requiredLong(Object value, String message) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String text) {
            try {
                return Long.parseLong(text);
            } catch (NumberFormatException exception) {
                throw new BadReqException(message, exception);
            }
        }
        throw new BadReqException(message);
    }
}
