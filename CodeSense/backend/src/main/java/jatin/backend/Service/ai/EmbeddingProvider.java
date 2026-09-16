package jatin.backend.Service.ai;

import org.springframework.ai.embedding.EmbeddingModel;

/** Identifies the embedding model selected for the active Spring profile. */
public interface EmbeddingProvider {

    String name();

    String model();

    int dimensions();

    EmbeddingModel embeddingModel();
}
