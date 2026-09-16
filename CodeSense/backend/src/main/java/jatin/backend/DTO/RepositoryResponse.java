package jatin.backend.DTO;

import java.time.Instant;
import java.util.UUID;

import jatin.backend.Entity.IndexStatus;

public record RepositoryResponse(
        UUID id,
        long githubRepoId,
        String owner,
        String name,
        String fullName,
        boolean isPrivate,
        String defaultBranch,
        String language,
        String htmlUrl,
        String description,
        IndexStatus indexStatus,
        Instant indexedAt,
        String indexedCommitSha,
        int chunkCount,
        int filesTotal,
        int filesProcessed,
        String errorMessage) {
}
