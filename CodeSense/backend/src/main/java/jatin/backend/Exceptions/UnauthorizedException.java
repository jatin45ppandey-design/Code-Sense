package jatin.backend.Exceptions;

/**
 * Thrown when the caller has not supplied valid authentication credentials.
 */
public class UnauthorizedException extends RuntimeException {

    /** Creates an unauthorized error with a client-safe message. */
    public UnauthorizedException(String message) {
        super(message);
    }

    /** Creates an unauthorized error while preserving its original cause. */
    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}
