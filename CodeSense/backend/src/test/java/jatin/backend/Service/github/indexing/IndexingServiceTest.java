package jatin.backend.Service.github.indexing;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.Filter;
import org.springframework.test.util.ReflectionTestUtils;

import jatin.backend.Entity.IndexStatus;
import jatin.backend.Entity.Repository;
import jatin.backend.Entity.User;
import jatin.backend.Repo.RepositoryRepo;
import jatin.backend.Service.UserService;
import jatin.backend.Service.github.GitHubRateLimiter;
import jatin.backend.Service.github.GithubApiClient;

@ExtendWith(MockitoExtension.class)
class IndexingServiceTest {

    @Mock RepositoryRepo repositoryRepo;
    @Mock UserService userService;
    @Mock GithubApiClient githubApiClient;
    @Mock CodeFileFilter fileFilter;
    @Mock CodeChunker codeChunker;
    @Mock GitHubRateLimiter rateLimiter;
    @Mock VectorStore vectorStore;

    @InjectMocks IndexingService indexingService;

    private UUID repositoryId;
    private UUID userId;
    private Repository repository;

    @BeforeEach
    void setUp() {
        repositoryId = UUID.randomUUID();
        userId = UUID.randomUUID();
        repository = new Repository();
        repository.setId(repositoryId);
        repository.setUserId(userId);
        repository.setOwner("octocat");
        repository.setName("hello-world");
        repository.setFullName("octocat/hello-world");
        repository.setDefaultBranch("main");
        repository.setIndexStatus(IndexStatus.INDEXING);

        ReflectionTestUtils.setField(indexingService, "maxFileBytes", 102_400L);
        ReflectionTestUtils.setField(indexingService, "maxChunks", 5_000);
        when(repositoryRepo.findByIdAndUserId(repositoryId, userId))
                .thenReturn(Optional.of(repository));
        User user = new User();
        when(userService.reqById(userId)).thenReturn(user);
        when(userService.decryptaccessToken(user)).thenReturn("token");
    }

    @Test
    void marksRepositoryReadyOnlyAfterVectorsAreWritten() {
        String path = "src/App.java";
        String commitSha = "abc123";
        Document document = new Document("class App {}", Map.of("repositoryId", repositoryId.toString()));
        when(githubApiClient.getCommitSha("token", "octocat", "hello-world", "main"))
                .thenReturn(commitSha);
        when(githubApiClient.getRepoTree("token", "octocat", "hello-world", commitSha))
                .thenReturn(tree(path));
        when(fileFilter.isEligible(path, 12L, 102_400L)).thenReturn(true);
        when(githubApiClient.getFileContent("token", "octocat", "hello-world", path, commitSha))
                .thenReturn("class App {}");
        when(codeChunker.chunkFile(
                repositoryId.toString(), "octocat", "hello-world", "main", path, "class App {}"))
                .thenReturn(List.of(document));

        indexingService.doIndex(repositoryId, userId);

        verify(vectorStore).add(List.of(document));
        assertEquals(IndexStatus.READY, repository.getIndexStatus());
        assertEquals(1, repository.getFilesProcessed());
        assertEquals(1, repository.getChunkCount());
        assertEquals(commitSha, repository.getIndexedCommitSha());
        verify(githubApiClient).getRepoTree("token", "octocat", "hello-world", commitSha);
        verify(githubApiClient).getFileContent("token", "octocat", "hello-world", path, commitSha);
    }

    @Test
    void preservesExistingVectorsWhenRepositoryHasNoIndexableFiles() {
        when(githubApiClient.getCommitSha("token", "octocat", "hello-world", "main"))
                .thenReturn("abc123");
        when(githubApiClient.getRepoTree("token", "octocat", "hello-world", "abc123"))
                .thenReturn(Map.of("tree", List.of(), "truncated", false));

        indexingService.indexAsync(repositoryId, userId);

        verify(vectorStore, never()).delete(any(Filter.Expression.class));
        verify(vectorStore, never()).add(any());
        assertEquals(IndexStatus.FAILED, repository.getIndexStatus());
        assertEquals("Repository contains no supported source files", repository.getErrorMessage());
    }

    @Test
    void cleansPartialVectorsAndMarksFailedWhenVectorWriteFails() {
        String path = "src/App.java";
        String commitSha = "abc123";
        Document document = new Document("class App {}", Map.of("repositoryId", repositoryId.toString()));
        repository.setIndexedCommitSha("previous-sha");
        when(githubApiClient.getCommitSha("token", "octocat", "hello-world", "main"))
                .thenReturn(commitSha);
        when(githubApiClient.getRepoTree("token", "octocat", "hello-world", commitSha))
                .thenReturn(tree(path));
        when(fileFilter.isEligible(path, 12L, 102_400L)).thenReturn(true);
        when(githubApiClient.getFileContent("token", "octocat", "hello-world", path, commitSha))
                .thenReturn("class App {}");
        when(codeChunker.chunkFile(any(), any(), any(), any(), eq(path), any()))
                .thenReturn(List.of(document));
        doThrow(new IllegalStateException("provider unavailable"))
                .when(vectorStore).add(any());

        indexingService.indexAsync(repositoryId, userId);

        verify(vectorStore, org.mockito.Mockito.times(2)).delete(any(Filter.Expression.class));
        assertEquals(IndexStatus.FAILED, repository.getIndexStatus());
        assertEquals(0, repository.getChunkCount());
        assertEquals("previous-sha", repository.getIndexedCommitSha());
        assertEquals("AI or repository provider is unavailable", repository.getErrorMessage());
    }

    private static Map<String, Object> tree(String path) {
        return Map.of(
                "tree", List.of(Map.of("type", "blob", "path", path, "size", 12L)),
                "truncated", false);
    }
}
