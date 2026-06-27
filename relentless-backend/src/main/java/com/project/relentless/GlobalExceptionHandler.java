package com.project.relentless;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.jsonwebtoken.JwtException;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@NullMarked
@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

  public record ErrorResponse(
      @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime timestamp,
      String message,
      int status) {}

  @ExceptionHandler({
    IllegalArgumentException.class,
    MethodArgumentTypeMismatchException.class,
    HttpMessageNotReadableException.class,
    HttpMediaTypeNotSupportedException.class
  })
  public ResponseEntity<ErrorResponse> handleBadRequest(Exception ex) {
    return buildResponse(HttpStatus.BAD_REQUEST, "Bad request", ex);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
    String message =
        ex.getBindingResult().getFieldErrors().stream()
            .map(err -> err.getField() + ": " + err.getDefaultMessage())
            .collect(Collectors.joining(", "));

    if (message.isBlank()) {
      message = "Bad request";
    }

    return buildResponse(HttpStatus.BAD_REQUEST, message, ex);
  }

  @ExceptionHandler({
    BadCredentialsException.class,
    AuthenticationCredentialsNotFoundException.class,
    InternalAuthenticationServiceException.class,
    JwtException.class
  })
  public ResponseEntity<ErrorResponse> handleUnauthorized(Exception ex) {
    return buildResponse(HttpStatus.UNAUTHORIZED, "Unauthorized", ex);
  }

  @ExceptionHandler(AuthorizationDeniedException.class)
  public ResponseEntity<ErrorResponse> handleForbidden(Exception ex) {
    return buildResponse(HttpStatus.FORBIDDEN, "Forbidden", ex);
  }

  @ExceptionHandler({EntityNotFoundException.class, NoResourceFoundException.class})
  public ResponseEntity<ErrorResponse> handleNotFound(Exception ex) {
    return buildResponse(HttpStatus.NOT_FOUND, "Not found", ex);
  }

  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  public ResponseEntity<ErrorResponse> handleMethodNotAllowed(Exception ex) {
    return buildResponse(HttpStatus.METHOD_NOT_ALLOWED, "Method not allowed", ex);
  }

  @ExceptionHandler({EntityExistsException.class, DataIntegrityViolationException.class})
  public ResponseEntity<ErrorResponse> handleConflict(Exception ex) {
    return buildResponse(HttpStatus.CONFLICT, "Conflict", ex);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleInternalServerError(Exception ex) {
    return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error", ex);
  }

  private ResponseEntity<ErrorResponse> buildResponse(
      HttpStatus status, String message, Exception ex) {
    if (status.is5xxServerError()) {
      log.error("{} ({}): {}", message, status.value(), ex.getMessage(), ex);
    } else {
      log.warn("{} ({}): {}", message, status.value(), ex.getMessage());
    }
    return new ResponseEntity<>(
        new ErrorResponse(LocalDateTime.now(), message, status.value()), status);
  }
}
