package com.project.relentless.feature.space.controller;

import com.project.relentless.feature.space.dto.response.AmenityResponse;
import com.project.relentless.feature.space.service.AmenityService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/amenities")
@RequiredArgsConstructor
public class AmenityController {

  private final AmenityService amenityService;

  @GetMapping
  public ResponseEntity<List<AmenityResponse>> getAll() {
    return ResponseEntity.ok(amenityService.getAll());
  }
}
