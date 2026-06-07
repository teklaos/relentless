package com.project.relentless.feature.booking.controller;

import com.project.relentless.feature.booking.dto.response.ReviewResponse;
import com.project.relentless.feature.booking.service.ReviewService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

  private final ReviewService reviewService;

  @GetMapping("/{spaceId}")
  public ResponseEntity<List<ReviewResponse>> getBySpaceId(@PathVariable Long spaceId) {
    return ResponseEntity.ok(reviewService.getBySpaceId(spaceId));
  }
}
