package jatin.backend.Service.ai;

import java.util.Locale;

import org.springframework.http.HttpStatus;

import jatin.backend.Exceptions.ExternalServiceException;

/** Maps provider failures to messages that are useful without exposing response bodies or credentials. */
public final class AiProviderErrors {

    private AiProviderErrors() {
    }

    public static ExternalServiceException sanitize(Throwable error) {
        String message = error.getMessage();
        String normalized = message == null ? "" : message.toLowerCase(Locale.ROOT);

        if (normalized.contains("401") || normalized.contains("api key")
                || normalized.contains("unauthorized")) {
            return failure(HttpStatus.BAD_GATEWAY, "AI provider authentication failed", error);
        }
        if (normalized.contains("429") || normalized.contains("rate limit")) {
            return failure(HttpStatus.TOO_MANY_REQUESTS, "AI provider rate limit exceeded", error);
        }
        if (normalized.contains("quota") || normalized.contains("credit")) {
            return failure(HttpStatus.BAD_GATEWAY, "AI provider quota is exhausted", error);
        }
        if (normalized.contains("model") && (normalized.contains("not found")
                || normalized.contains("unsupported") || normalized.contains("invalid"))) {
            return failure(HttpStatus.BAD_GATEWAY, "Configured AI model is unavailable", error);
        }
        if (normalized.contains("timeout") || normalized.contains("timed out")) {
            return failure(HttpStatus.GATEWAY_TIMEOUT, "AI provider request timed out", error);
        }
        if (normalized.contains("connect") || normalized.contains("unavailable")) {
            return failure(HttpStatus.SERVICE_UNAVAILABLE, "AI provider is unavailable", error);
        }
        return failure(HttpStatus.BAD_GATEWAY, "AI provider request failed", error);
    }

    private static ExternalServiceException failure(
            HttpStatus status, String message, Throwable error) {
        return new ExternalServiceException(status, message,
                error instanceof Exception exception ? exception : new RuntimeException(error));
    }
}
