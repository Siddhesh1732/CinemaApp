package com.project.cinema.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ── Helper: builds a consistent error response structure ──────────────
    private Map<String, Object> buildError(HttpStatus status, String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", status.value());
        error.put("error", status.getReasonPhrase());
        error.put("message", message);
        return error;
    }

    // ─────────────────────────────────────────────────────────────────────
    // AUTH EXCEPTIONS
    // ─────────────────────────────────────────────────────────────────────

    // Wrong email or password during login
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(buildError(HttpStatus.UNAUTHORIZED, ex.getMessage()));
    }

    // User not found by email (used by CustomUserDetailsService + AuthService)
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUsernameNotFound(UsernameNotFoundException ex) {
        log.warn("User lookup failed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildError(HttpStatus.NOT_FOUND, ex.getMessage()));
    }

    // ─────────────────────────────────────────────────────────────────────
    // SECURITY EXCEPTIONS
    // ─────────────────────────────────────────────────────────────────────

    // User is authenticated but doesn't have required role (e.g., non-admin hits admin endpoint)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(buildError(HttpStatus.FORBIDDEN, "You do not have permission to perform this action"));
    }

    // ─────────────────────────────────────────────────────────────────────
    // VALIDATION EXCEPTIONS
    // ─────────────────────────────────────────────────────────────────────

    // @Valid fails on request DTOs — returns field-level errors
    // e.g., "email must be valid", "password must be at least 6 characters"
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> fieldErrors.put(error.getField(), error.getDefaultMessage()));

        log.warn("Validation failed: {}", fieldErrors);

        Map<String, Object> response = buildError(HttpStatus.BAD_REQUEST, "Validation failed");
        response.put("fieldErrors", fieldErrors);  // Extra field showing exactly what failed
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // Wrong type in path variable — e.g., /api/movies/abc instead of /api/movies/1
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = String.format("Invalid value '%s' for parameter '%s'", ex.getValue(), ex.getName());
        log.warn("Type mismatch: {}", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError(HttpStatus.BAD_REQUEST, message));
    }

    // ─────────────────────────────────────────────────────────────────────
    // BUSINESS LOGIC EXCEPTIONS (RuntimeException)
    // Covers all service-layer throws across all 7 combos:
    //
    // AUTH    → "Email already registered", "Username already taken"
    // MOVIE   → "Movie not found with id: x"
    // GENRE   → "Genre not found", "Genre already exists"
    // CAST    → "Cast member not found with id: x"
    // LIST    → "Movie already in WATCHED list", "Add movie to WATCHED before rating"
    // FRIEND  → "Friendship already exists", "You must be friends to view this list"
    //           "Friend request not found", "Request is no longer pending"
    //           "You cannot send a friend request to yourself"
    // ─────────────────────────────────────────────────────────────────────
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        log.error("Business logic error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError(HttpStatus.BAD_REQUEST, ex.getMessage()));
    }

    // ─────────────────────────────────────────────────────────────────────
    // CATCH-ALL — anything unexpected
    // ─────────────────────────────────────────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        log.error("Unexpected error occurred: ", ex);  // Full stack trace logged
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong. Please try again."));
    }
}