package com.project.relentless.feature.booking.controller;

import com.project.relentless.feature.booking.dto.request.CreateBookingRequest;
import com.project.relentless.feature.booking.dto.response.BookingCheckoutResponse;
import com.project.relentless.feature.booking.dto.response.BookingResponse;
import com.project.relentless.feature.booking.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

  private final BookingService bookingService;

  @GetMapping
  public ResponseEntity<List<BookingResponse>> getAll() {
    return ResponseEntity.ok(bookingService.getAll());
  }

  @GetMapping("/me")
  public ResponseEntity<List<BookingResponse>> getByCurrentUser() {
    return ResponseEntity.ok(bookingService.getByCurrentUser());
  }

  @GetMapping("/me/hosted")
  public ResponseEntity<List<BookingResponse>> getHostedByCurrentUser() {
    return ResponseEntity.ok(bookingService.getHostedByCurrentUser());
  }

  @PostMapping
  public ResponseEntity<BookingCheckoutResponse> create(
      @Valid @RequestBody CreateBookingRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.create(request));
  }
}
