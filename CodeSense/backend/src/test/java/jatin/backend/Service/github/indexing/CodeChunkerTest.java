package jatin.backend.Service.github.indexing;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;

import jatin.backend.Service.ai.RagSettings;

class CodeChunkerTest {

    @Test
    void addsRepositoryIdentityToEveryChunk() {
        CodeChunker chunker = new CodeChunker(800, new CodeFileFilter());

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
        }
    }
}
