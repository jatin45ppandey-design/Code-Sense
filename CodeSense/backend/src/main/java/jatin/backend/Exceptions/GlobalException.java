package jatin.backend.Exceptions;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

/**
 * Converts application exceptions into consistent API error responses.
 */
@RestControllerAdvice
@Slf4j
public class GlobalException {

    /** Converts invalid client input into an HTTP 400 response. */
    @ExceptionHandler(BadReqException.class)
    public ResponseEntity<ApiError> handleBadRequest(BadReqException exception,
                                                      HttpServletRequest request) {
        return error(HttpStatus.BAD_REQUEST, exception, request);
    }

    /** Converts a missing application resource into an HTTP 404 response. */
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NotFoundException exception,
                                                    HttpServletRequest request) {
        return error(HttpStatus.NOT_FOUND, exception, request);
    }

    /** Converts an authentication failure raised by application code into HTTP 401. */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiError> handleUnauthorized(UnauthorizedException exception,
                                                        HttpServletRequest request) {
        return error(HttpStatus.UNAUTHORIZED, exception, request);
    }

    /** Preserves a safe provider-specific status without returning provider response bodies. */
    @ExceptionHandler(ExternalServiceException.class)
    public ResponseEntity<ApiError> handleExternalService(ExternalServiceException exception,
                                                           HttpServletRequest request) {
        return error(exception.getStatus(), exception, request);
    }

    /** Returns a stable response for invalid request-body fields. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception,
                                                       HttpServletRequest request) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .orElse("Request validation failed");
        return error(HttpStatus.BAD_REQUEST, message, request);
    }

    @ExceptionHandler({ConstraintViolationException.class, HttpMessageNotReadableException.class})
    public ResponseEntity<ApiError> handleInvalidRequest(Exception exception,
                                                          HttpServletRequest request) {
        return error(HttpStatus.BAD_REQUEST, "Request validation failed", request);
    }

    /** Prevents unexpected implementation details and credentials from reaching API clients. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception exception,
                                                       HttpServletRequest request) {
        log.error("Unhandled request failure at {} ({})", request.getRequestURI(),
                exception.getClass().getSimpleName());
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected server error occurred", request);
    }

    /** Builds the shared JSON shape returned by all handled application errors. */
    private ResponseEntity<ApiError> error(HttpStatus status, RuntimeException exception,
                                           HttpServletRequest request) {
        return error(status, exception.getMessage(), request);
    }

    private ResponseEntity<ApiError> error(HttpStatus status, String message,
                                           HttpServletRequest request) {
        ApiError body = new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI()
        );
        return ResponseEntity.status(status).body(body);
    }

    /** Represents the JSON error body returned to an API client. */
    public record ApiError(Instant timestamp, int status, String error,
                           String message, String path) {
    }
}
