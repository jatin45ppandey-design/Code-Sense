package jatin.backend.Service.ai.ollama;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.ollama.api.OllamaChatOptions;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import jatin.backend.Service.ai.ChatProvider;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;

/** Keeps the existing local Ollama chat behavior, including disabled thinking output. */
@Component
@Profile("local")
@RequiredArgsConstructor
public class OllamaChatProvider implements ChatProvider {

    private final ChatModel chatModel;

    @Override
    public String name() {
        return "ollama";
    }

    @Override
    public Flux<String> stream(String systemPrompt, String userPrompt) {
        return ChatClient.builder(chatModel)
                .build()
                .prompt()
                .options(OllamaChatOptions.builder().disableThinking())
                .system(systemPrompt)
                .user(userPrompt)
                .stream()
                .content();
    }
}
