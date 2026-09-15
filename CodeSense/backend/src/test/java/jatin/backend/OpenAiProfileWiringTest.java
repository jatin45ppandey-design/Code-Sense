package jatin.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiEmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(properties = "spring.ai.openai.api-key=test-only-openai-key")
@ActiveProfiles("openai")
class OpenAiProfileWiringTest {

    @MockitoBean
    private VectorStore vectorStore;

    @Autowired private ApplicationContext applicationContext;
    @Autowired private ChatModel chatModel;
    @Autowired private EmbeddingModel embeddingModel;
    @Autowired private Environment environment;

    @Test
    void activatesOnlyOpenAiModelsAndItsVectorTable() {
        assertEquals(1, applicationContext.getBeansOfType(ChatModel.class).size());
        assertEquals(1, applicationContext.getBeansOfType(EmbeddingModel.class).size());
        assertInstanceOf(OpenAiChatModel.class, chatModel);
        assertInstanceOf(OpenAiEmbeddingModel.class, embeddingModel);
        assertEquals("vector_store_openai",
                environment.getProperty("spring.ai.vectorstore.pgvector.table-name"));
        assertEquals("1536", environment.getProperty("spring.ai.vectorstore.pgvector.dimensions"));
    }
}
