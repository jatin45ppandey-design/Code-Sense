package jatin.backend.Controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jatin.backend.DTO.IndexStatusResponse;
import jatin.backend.DTO.RepositoryResponse;
import jatin.backend.Entity.Repository;
import jatin.backend.Exceptions.ExternalServiceException;
import jatin.backend.Service.RepoService;
import jatin.backend.Service.github.indexing.IndexingService;
import jatin.backend.security.CurrentUser;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/repos")
@RequiredArgsConstructor
public class RepoController {

    private final CurrentUser currentUser;
    private final RepoService repoService;

    private final IndexingService indexingService;

    @GetMapping
    public List<RepositoryResponse> list(
            @RequestParam(name = "refresh", defaultValue = "true") boolean refresh) {
        UUID userId = currentUser.require().getUser().getId();
        if (refresh) {
            return repoService.syncAndListRepos(userId);
        }
        return repoService.listStored(userId);
    }

    @GetMapping("/{id}")
    public RepositoryResponse get(@PathVariable UUID id) {
        UUID userId = currentUser.require().getUser().getId();
        return repoService.toResponse(repoService.requireOwned(id, userId));
    }

    @PostMapping("/{id}/index")
    public ResponseEntity<RepositoryResponse> index(@PathVariable UUID id) {
        UUID userId = currentUser.require().getUser().getId();
        Repository repo = indexingService.startIndexing(id, userId);
        try {
            indexingService.indexAsync(id, userId);
        } catch (TaskRejectedException exception) {
            indexingService.markFailedToSchedule(id, userId);
            throw new ExternalServiceException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Indexing queue is full; try again later",
                    exception);
        }
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(repoService.toResponse(repo));
    }

    @GetMapping("/{id}/status")
    public IndexStatusResponse status(@PathVariable UUID id) {
        UUID userId = currentUser.require().getUser().getId();
        return repoService.status(id, userId);
    }

}
