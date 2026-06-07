package com.project.relentless.feature.booking.controller;

import com.project.relentless.feature.booking.dto.response.BookingResponse;
import com.project.relentless.feature.booking.service.BookingService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

  private final BookingService bookingService;

  @GetMapping("/me")
  public ResponseEntity<List<BookingResponse>> getByCurrentUser() {
    return ResponseEntity.ok(bookingService.getByCurrentUser());
  }
}
