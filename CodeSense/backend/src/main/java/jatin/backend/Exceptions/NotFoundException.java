package jatin.backend.Exceptions;

/**
 * Thrown when a requested application resource does not exist.
 */
public class NotFoundException extends RuntimeException {

    /** Creates a not-found error with a client-safe message. */
    public NotFoundException(String message) {
        super(message);
    }

    /** Creates a not-found error while preserving its original cause. */
    public NotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
