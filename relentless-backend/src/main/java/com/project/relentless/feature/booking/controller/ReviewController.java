package com.project.relentless.feature.booking.controller;

import com.project.relentless.feature.booking.dto.request.LeaveReviewRequest;
import com.project.relentless.feature.booking.dto.response.ReviewResponse;
import com.project.relentless.feature.booking.service.ReviewService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

  private final ReviewService reviewService;

  @GetMapping("/{spaceId}")
  public ResponseEntity<List<ReviewResponse>> getBySpaceId(@PathVariable Long spaceId) {
    return ResponseEntity.ok(reviewService.getBySpaceId(spaceId));
  }

  @GetMapping("/me/hosted")
  public ResponseEntity<List<ReviewResponse>> getHostedByCurrentUser() {
    return ResponseEntity.ok(reviewService.getHostedByCurrentUser());
  }

  @PostMapping
  public ResponseEntity<ReviewResponse> leave(@Valid @RequestBody LeaveReviewRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.leave(request));
  }
}
