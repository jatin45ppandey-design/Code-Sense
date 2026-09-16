package jatin.backend;

import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:backend-context;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password="
})
@ActiveProfiles("local")
class BackendApplicationTests {

    @MockitoBean
    private ChatModel chatModel;

    @MockitoBean
    private EmbeddingModel embeddingModel;

    @MockitoBean
    private VectorStore vectorStore;

    @Test
    void contextLoads() {
    }

}
