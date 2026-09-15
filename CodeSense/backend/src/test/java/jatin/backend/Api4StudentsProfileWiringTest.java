package jatin.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.ollama.OllamaEmbeddingModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(properties = "spring.ai.openai.api-key=test-only-api4students-key")
@ActiveProfiles("api4students")
class Api4StudentsProfileWiringTest {

    @MockitoBean
    private VectorStore vectorStore;

    @Autowired private ApplicationContext applicationContext;
    @Autowired private ChatModel chatModel;
    @Autowired private EmbeddingModel embeddingModel;
    @Autowired private Environment environment;

    @Test
    void usesApi4StudentsChatWithOllamaEmbeddings() {
        assertEquals(1, applicationContext.getBeansOfType(ChatModel.class).size());
        assertEquals(1, applicationContext.getBeansOfType(EmbeddingModel.class).size());
        assertInstanceOf(OpenAiChatModel.class, chatModel);
        assertInstanceOf(OllamaEmbeddingModel.class, embeddingModel);
        assertEquals("https://api.namansoni.in/v1",
                environment.getProperty("spring.ai.openai.base-url"));
        assertEquals("gpt-5.4-nano", environment.getProperty("spring.ai.openai.chat.model"));
        assertEquals("nomic-embed-text",
                environment.getProperty("spring.ai.ollama.embedding.model"));
        assertEquals("vector_store_local",
                environment.getProperty("spring.ai.vectorstore.pgvector.table-name"));
        assertEquals("768", environment.getProperty("spring.ai.vectorstore.pgvector.dimensions"));
    }
}
