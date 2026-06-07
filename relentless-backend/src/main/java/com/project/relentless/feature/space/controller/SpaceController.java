package com.project.relentless.feature.space.controller;

import com.project.relentless.feature.space.dto.response.SpaceResponse;
import com.project.relentless.feature.space.service.SpaceService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/spaces")
@RequiredArgsConstructor
public class SpaceController {

  private final SpaceService spaceService;

  @GetMapping
  public ResponseEntity<List<SpaceResponse>> getAll() {
    return ResponseEntity.ok(spaceService.getAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<SpaceResponse> getById(@PathVariable Long id) {
    return ResponseEntity.ok(spaceService.getById(id));
  }
}
