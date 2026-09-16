package jatin.backend.Config;

import java.util.Arrays;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import jatin.backend.Service.ai.ChatProvider;
import jatin.backend.Service.ai.EmbeddingProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** Logs selected providers only; secrets and connection details are deliberately excluded. */
@Component
@RequiredArgsConstructor
@Slf4j
public class AiConfigurationLogger {

    private final Environment environment;
    private final ChatProvider chatProvider;
    private final EmbeddingProvider embeddingProvider;

    @EventListener(ApplicationReadyEvent.class)
    void logConfiguration() {
        log.info("CodeSense AI Configuration | Profile: {} | Chat: {} | Embeddings: {} ({}, {} dimensions)",
                String.join(",", Arrays.asList(environment.getActiveProfiles())),
                chatProvider.name(),
                embeddingProvider.name(),
                embeddingProvider.model(),
                embeddingProvider.dimensions());
    }
}
