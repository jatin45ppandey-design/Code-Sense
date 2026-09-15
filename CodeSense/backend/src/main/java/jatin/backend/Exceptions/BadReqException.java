package jatin.backend.Exceptions;

/**
 * Thrown when a request is syntactically valid but contains invalid data for
 * the requested operation.
 */
public class BadReqException extends RuntimeException {

    /** Creates a bad-request error with a client-safe message. */
    public BadReqException(String message) {
        super(message);
    }

    /** Creates a bad-request error while preserving its original cause. */
    public BadReqException(String message, Throwable cause) {
        super(message, cause);
    }
}
