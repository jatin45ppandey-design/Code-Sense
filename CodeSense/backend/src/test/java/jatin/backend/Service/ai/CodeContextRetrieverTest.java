package jatin.backend.Service.ai;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;

import jatin.backend.DTO.CitationDto;

class CodeContextRetrieverTest {

    @Test
    void discardsAnyCrossRepositoryDocumentReturnedByTheStore() {
        UUID repositoryId = UUID.randomUUID();
        Document owned = new Document("owned code", Map.of(
                RagSettings.METADATA_REPOSITORY_ID, repositoryId.toString(),
                "filePath", "src/Owned.java"));
        Document foreign = new Document("foreign code", Map.of(
                RagSettings.METADATA_REPOSITORY_ID, UUID.randomUUID().toString(),
                "filePath", "src/Foreign.java"));

        VectorStore vectorStore = mock(VectorStore.class);
        CitationMapper citationMapper = mock(CitationMapper.class);
        when(vectorStore.similaritySearch(org.mockito.ArgumentMatchers.any(SearchRequest.class)))
                .thenReturn(List.of(owned, foreign));
        when(citationMapper.fromDocument(owned))
                .thenReturn(new CitationDto("src/Owned.java", null, null, "java"));

        RetrievedContext result = new CodeContextRetriever(vectorStore, citationMapper)
                .retrieve(repositoryId, "question");

        assertEquals("owned code", result.contextText());
        assertEquals(List.of(new CitationDto("src/Owned.java", null, null, "java")),
                result.citations());

        ArgumentCaptor<SearchRequest> request = ArgumentCaptor.forClass(SearchRequest.class);
        verify(vectorStore).similaritySearch(request.capture());
        assertTrue(request.getValue().getFilterExpression().toString().contains("repositoryId"));
        assertTrue(request.getValue().getFilterExpression().toString().contains(repositoryId.toString()));
    }
}
