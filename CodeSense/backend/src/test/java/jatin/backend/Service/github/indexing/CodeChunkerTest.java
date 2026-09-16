package jatin.backend.Service.github.indexing;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;

import jatin.backend.Service.ai.RagSettings;
import jatin.backend.Service.ai.EmbeddingProvider;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CodeChunkerTest {

    @Test
    void addsRepositoryIdentityToEveryChunk() {
        EmbeddingProvider embeddingProvider = mock(EmbeddingProvider.class);
        when(embeddingProvider.name()).thenReturn("ollama");
        when(embeddingProvider.model()).thenReturn("nomic-embed-text");
        when(embeddingProvider.dimensions()).thenReturn(768);
        CodeChunker chunker = new CodeChunker(800, new CodeFileFilter(), embeddingProvider);

        List<Document> chunks = chunker.chunkFile(
                "repository-id", "octocat", "hello-world", "main",
                "src/App.java", "class App { }\n");

        assertFalse(chunks.isEmpty());
        for (Document chunk : chunks) {
            assertEquals("repository-id", chunk.getMetadata().get(RagSettings.METADATA_REPOSITORY_ID));
            assertEquals("octocat", chunk.getMetadata().get(RagSettings.METADATA_OWNER));
            assertEquals("hello-world", chunk.getMetadata().get(RagSettings.METADATA_REPOSITORY));
            assertEquals("main", chunk.getMetadata().get(RagSettings.METADATA_BRANCH));
            assertEquals("src/App.java", chunk.getMetadata().get("filePath"));
            assertEquals("java", chunk.getMetadata().get("language"));
            assertEquals("ollama", chunk.getMetadata().get("embeddingProvider"));
            assertEquals("nomic-embed-text", chunk.getMetadata().get("embeddingModel"));
            assertEquals(768, chunk.getMetadata().get("embeddingDimensions"));
        }
    }
}
