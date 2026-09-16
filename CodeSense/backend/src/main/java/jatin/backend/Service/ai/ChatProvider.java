package jatin.backend.Service.ai;

import reactor.core.publisher.Flux;

/** Provider-neutral streaming chat contract used by the RAG pipeline. */
public interface ChatProvider {

    String name();

    Flux<String> stream(String systemPrompt, String userPrompt);
}
