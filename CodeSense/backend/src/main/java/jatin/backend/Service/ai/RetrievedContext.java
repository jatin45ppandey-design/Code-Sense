package jatin.backend.Service.ai;

import java.util.List;

import jatin.backend.DTO.CitationDto;

public record RetrievedContext(
        List<CitationDto> citations,
        String contextText) {
}