package jatin.backend.Service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
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

import jatin.backend.DTO.RepositoryResponse;
import jatin.backend.Entity.Repository;
import jatin.backend.Entity.User;
import jatin.backend.Repo.RepositoryRepo;
import jatin.backend.Service.github.GitHubRepositoryUrlParser;
import jatin.backend.Service.github.GithubApiClient;

@ExtendWith(MockitoExtension.class)
class RepoServiceTest {
    @Mock RepositoryRepo repositoryRepo;
    @Mock UserService userService;
    @Mock GithubApiClient githubApiClient;
    @Mock GitHubRepositoryUrlParser repositoryUrlParser;
    @InjectMocks RepoService repoService;

    private UUID userId;
    private User user;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User();
        when(userService.reqById(userId)).thenReturn(user);
        when(userService.decryptaccessToken(user)).thenReturn("token");
    }

    @Test
    void importsCanonicalMetadataIntoTheExistingUserRepositoryRow() {
        Repository existing = new Repository();
        UUID repositoryId = UUID.randomUUID();
        existing.setId(repositoryId);
        when(repositoryUrlParser.parse("https://github.com/facebook/react"))
                .thenReturn(new GitHubRepositoryUrlParser.RepositoryAddress("facebook", "react"));
        when(githubApiClient.getRepository("token", "facebook", "react")).thenReturn(metadata());
        when(repositoryRepo.findByUserIdAndGithubRepoId(userId, 10270250L))
                .thenReturn(Optional.of(existing));
        when(repositoryRepo.save(existing)).thenReturn(existing);

        RepositoryResponse response = repoService.importFromUrl(userId, "https://github.com/facebook/react");

        assertEquals(repositoryId, response.id());
        assertEquals(10270250L, response.githubRepoId());
        assertEquals("facebook/react", response.fullName());
        verify(repositoryRepo).save(existing);
    }

    @Test
    void syncReturnsAllStoredRepositoriesIncludingUrlImports() {
        Repository imported = repository("facebook/react", 10270250L);
        Repository synchronizedRepository = repository("octocat/hello-world", 1L);
        when(githubApiClient.listUserRepos("token")).thenReturn(List.of(metadata()));
        when(repositoryRepo.findByUserIdAndGithubRepoId(userId, 10270250L))
                .thenReturn(Optional.of(imported));
        when(repositoryRepo.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(repositoryRepo.findByUserIdOrderByFullNameAsc(userId))
                .thenReturn(List.of(imported, synchronizedRepository));

        List<RepositoryResponse> result = repoService.syncAndListRepos(userId);

        assertEquals(List.of("facebook/react", "octocat/hello-world"),
                result.stream().map(RepositoryResponse::fullName).toList());
    }

    private static Repository repository(String fullName, long githubRepoId) {
        Repository repository = new Repository();
        repository.setId(UUID.randomUUID());
        repository.setGithubRepoId(githubRepoId);
        repository.setFullName(fullName);
        repository.setOwner(fullName.substring(0, fullName.indexOf('/')));
        repository.setName(fullName.substring(fullName.indexOf('/') + 1));
        return repository;
    }

    private static Map<String, Object> metadata() {
        return Map.of(
                "id", 10270250L,
                "name", "react",
                "owner", Map.of("login", "facebook"),
                "full_name", "facebook/react",
                "private", false,
                "default_branch", "main",
                "html_url", "https://github.com/facebook/react");
    }
}
