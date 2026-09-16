package jatin.backend.Service.ai.gemini;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import jatin.backend.Service.ai.ChatProvider;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;

/** Streams the existing RAG prompts through Spring AI's Google GenAI chat model. */
@Component
@Profile("gemini")
@RequiredArgsConstructor
public class GeminiChatProvider implements ChatProvider {

    private final ChatModel chatModel;

    @Override
    public String name() {
        return "gemini";
    }

    @Override
    public Flux<String> stream(String systemPrompt, String userPrompt) {
        return ChatClient.builder(chatModel)
                .build()
                .prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .stream()
                .content();
    }
}
