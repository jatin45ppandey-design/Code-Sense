package jatin.backend.DTO;


import java.time.Instant;
import java.util.List;
import java.util.UUID;

import jatin.backend.Entity.MessageRole;

public record ChatMessageResponse(
        UUID id,
        MessageRole role,
        String content,
        List<CitationDto> citations,
        Instant createdAt) {
}