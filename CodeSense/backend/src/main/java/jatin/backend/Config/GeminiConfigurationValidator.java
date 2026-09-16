package jatin.backend.Config;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/** Fails deterministically instead of attempting an unavailable local provider in Gemini mode. */
@Component
@Profile("gemini")
public class GeminiConfigurationValidator {

    private final String apiKey;

    public GeminiConfigurationValidator(
            @Value("${spring.ai.google.genai.api-key:}") String apiKey) {
        this.apiKey = apiKey;
    }

    @PostConstruct
    void validate() {
        if (apiKey.isBlank()) {
            throw new IllegalStateException(
                    "GEMINI_API_KEY must be set when APP_MODE=gemini");
        }
    }
}
