package jatin.backend.Service.ai;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.HttpClientErrorException;

class AiProviderErrorsTest {

    @Test
    void removesProviderDetailsFromAuthenticationFailures() {
        var result = AiProviderErrors.sanitize(
                new IllegalStateException("401 incorrect API key provided"));

        assertEquals(HttpStatus.BAD_GATEWAY, result.getStatus());
        assertEquals("AI provider authentication failed", result.getMessage());
    }

    @Test
    void mapsTimeoutsToGatewayTimeout() {
        var result = AiProviderErrors.sanitize(
                new IllegalStateException("upstream request timed out"));

        assertEquals(HttpStatus.GATEWAY_TIMEOUT, result.getStatus());
        assertEquals("AI provider request timed out", result.getMessage());
    }

    @Test
    void mapsRateLimitStatusWithoutExposingProviderBody() {
        var result = AiProviderErrors.sanitize(HttpClientErrorException.create(
                HttpStatus.TOO_MANY_REQUESTS, "provider", null, null, null));

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, result.getStatus());
        assertEquals("AI provider rate limit exceeded", result.getMessage());
    }

    @Test
    void mapsTemporaryUnavailableStatus() {
        var result = AiProviderErrors.sanitize(HttpServerErrorException.create(
                HttpStatus.SERVICE_UNAVAILABLE, "provider", null, null, null));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, result.getStatus());
        assertEquals("AI provider is temporarily unavailable", result.getMessage());
    }

    @Test
    void mapsProviderTimeoutStatus() {
        var result = AiProviderErrors.sanitize(HttpServerErrorException.create(
                HttpStatus.GATEWAY_TIMEOUT, "provider", null, null, null));

        assertEquals(HttpStatus.GATEWAY_TIMEOUT, result.getStatus());
        assertEquals("AI provider request timed out", result.getMessage());
    }

    @Test
    void mapsProviderFailureStatus() {
        var result = AiProviderErrors.sanitize(HttpServerErrorException.create(
                HttpStatus.BAD_GATEWAY, "provider", null, null, null));

        assertEquals(HttpStatus.BAD_GATEWAY, result.getStatus());
        assertEquals("AI provider request failed", result.getMessage());
    }
}
