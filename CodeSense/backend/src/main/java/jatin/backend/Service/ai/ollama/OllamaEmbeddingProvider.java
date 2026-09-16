package jatin.backend.Service.ai.ollama;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import jatin.backend.Service.ai.EmbeddingProvider;
import lombok.RequiredArgsConstructor;

/** Exposes the active local Ollama embedding model without duplicating Spring AI's implementation. */
@Component
@Profile("local")
@RequiredArgsConstructor
public class OllamaEmbeddingProvider implements EmbeddingProvider {

    private final EmbeddingModel embeddingModel;

    @Value("${app.ai.embedding-model}")
    private String model;

    @Value("${app.ai.embedding-dimensions}")
    private int dimensions;

    @Override
    public String name() {
        return "ollama";
    }

    @Override
    public String model() {
        return model;
    }

    @Override
    public int dimensions() {
        return dimensions;
    }

    @Override
    public EmbeddingModel embeddingModel() {
        return embeddingModel;
    }
}
