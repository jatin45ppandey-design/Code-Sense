package jatin.backend.DTO;

import java.time.Instant;
import java.util.UUID;

import jatin.backend.Entity.IndexStatus;

public record IndexStatusResponse(
        UUID repositoryId,
        IndexStatus status,
        int filesTotal,
        int filesProcessed,
        int chunkCount,
        Instant indexedAt,
        String errorMessage) {
}
