package jatin.backend.Service.ai;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import jatin.backend.Exceptions.ExternalServiceException;

/** Maps provider failures to messages that are useful without exposing response bodies or credentials. */
public final class AiProviderErrors {

    private AiProviderErrors() {
    }

    public static ExternalServiceException sanitize(Throwable error) {
        HttpStatus status = providerStatus(error);
        if (status != null) {
            return failure(status, messageFor(status), error);
        }

        String message = error.getMessage();
        String normalized = message == null ? "" : message.toLowerCase(Locale.ROOT);

        if (normalized.contains("401") || normalized.contains("api key")
                || normalized.contains("unauthorized")) {
            return failure(HttpStatus.BAD_GATEWAY, "AI provider authentication failed", error);
        }
        if (normalized.contains("429") || normalized.contains("rate limit")) {
            return failure(HttpStatus.TOO_MANY_REQUESTS, "AI provider rate limit exceeded", error);
        }
        if (normalized.contains("503") || normalized.contains("high demand")
                || normalized.contains("temporarily unavailable")) {
            return failure(HttpStatus.SERVICE_UNAVAILABLE,
                    "AI provider is temporarily unavailable", error);
        }
        if (normalized.contains("504")) {
            return failure(HttpStatus.GATEWAY_TIMEOUT, "AI provider request timed out", error);
        }
        if (normalized.contains("502")) {
            return failure(HttpStatus.BAD_GATEWAY, "AI provider request failed", error);
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
            return failure(HttpStatus.SERVICE_UNAVAILABLE,
                    "AI provider is temporarily unavailable", error);
        }
        return failure(HttpStatus.BAD_GATEWAY, "AI provider request failed", error);
    }

    private static HttpStatus providerStatus(Throwable error) {
        for (Throwable current = error; current != null; current = current.getCause()) {
            if (current instanceof HttpStatusCodeException exception) {
                return toHttpStatus(exception.getStatusCode().value());
            }
            if (current instanceof WebClientResponseException exception) {
                return toHttpStatus(exception.getStatusCode().value());
            }
        }
        return null;
    }

    private static HttpStatus toHttpStatus(int status) {
        return switch (status) {
            case 429 -> HttpStatus.TOO_MANY_REQUESTS;
            case 503 -> HttpStatus.SERVICE_UNAVAILABLE;
            case 504 -> HttpStatus.GATEWAY_TIMEOUT;
            case 502 -> HttpStatus.BAD_GATEWAY;
            default -> null;
        };
    }

    private static String messageFor(HttpStatus status) {
        return switch (status) {
            case TOO_MANY_REQUESTS -> "AI provider rate limit exceeded";
            case SERVICE_UNAVAILABLE -> "AI provider is temporarily unavailable";
            case GATEWAY_TIMEOUT -> "AI provider request timed out";
            default -> "AI provider request failed";
        };
    }

    private static ExternalServiceException failure(
            HttpStatus status, String message, Throwable error) {
        return new ExternalServiceException(status, message,
                error instanceof Exception exception ? exception : new RuntimeException(error));
    }
}
