package jatin.backend.Exceptions;

import org.springframework.http.HttpStatus;

/** A sanitized failure returned by an external provider such as GitHub or an AI service. */
public class ExternalServiceException extends RuntimeException {

    private final HttpStatus status;

    public ExternalServiceException(HttpStatus status, String message, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
