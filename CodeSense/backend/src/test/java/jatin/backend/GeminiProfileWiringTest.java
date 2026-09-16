package jatin.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.ai.google.genai.text.GoogleGenAiTextEmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(properties = {
        "spring.ai.google.genai.api-key=test-only-gemini-key",
        "spring.ai.google.genai.embedding.api-key=test-only-gemini-key",
        "spring.datasource.url=jdbc:h2:mem:gemini-wiring;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password="
})
@ActiveProfiles("gemini")
class GeminiProfileWiringTest {

    @MockitoBean
    private VectorStore vectorStore;

    @Autowired private ApplicationContext applicationContext;
    @Autowired private ChatModel chatModel;
    @Autowired private EmbeddingModel embeddingModel;
    @Autowired private Environment environment;

    @Test
    void activatesOnlyGoogleGenAiModelsAndItsVectorTable() {
        assertEquals(1, applicationContext.getBeansOfType(ChatModel.class).size());
        assertEquals(1, applicationContext.getBeansOfType(EmbeddingModel.class).size());
        assertInstanceOf(GoogleGenAiChatModel.class, chatModel);
        assertInstanceOf(GoogleGenAiTextEmbeddingModel.class, embeddingModel);
        assertEquals("vector_store_gemini",
                environment.getProperty("spring.ai.vectorstore.pgvector.table-name"));
        assertEquals("768", environment.getProperty("spring.ai.vectorstore.pgvector.dimensions"));
    }
}
