package jatin.backend.Service.ai;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

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
}
