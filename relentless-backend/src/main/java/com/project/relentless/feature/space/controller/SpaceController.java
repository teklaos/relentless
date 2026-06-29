package com.project.relentless.feature.space.controller;

import com.project.relentless.feature.space.dto.request.SpaceRequest;
import com.project.relentless.feature.space.dto.response.SpaceResponse;
import com.project.relentless.feature.space.service.SpaceService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/spaces")
@RequiredArgsConstructor
public class SpaceController {

  private final SpaceService spaceService;

  @GetMapping
  public ResponseEntity<List<SpaceResponse>> getAll() {
    return ResponseEntity.ok(spaceService.getAll());
  }

  @GetMapping("/me/saved")
  public ResponseEntity<List<SpaceResponse>> getSavedByCurrentUser() {
    return ResponseEntity.ok(spaceService.getSavedByCurrentUser());
  }

  @GetMapping("/me/hosted")
  public ResponseEntity<List<SpaceResponse>> getHostedByCurrentUser() {
    return ResponseEntity.ok(spaceService.getHostedByCurrentUser());
  }

  @GetMapping("/{id}")
  public ResponseEntity<SpaceResponse> getById(@PathVariable Long id) {
    return ResponseEntity.ok(spaceService.getById(id));
  }

  @PostMapping("/{id}/save")
  public ResponseEntity<Void> save(@PathVariable Long id) {
    spaceService.save(id);
    return ResponseEntity.ok().build();
  }

  @DeleteMapping("/{id}/unsave")
  public ResponseEntity<Void> unsave(@PathVariable Long id) {
    spaceService.unsave(id);
    return ResponseEntity.noContent().build();
  }

  @PostMapping
  public ResponseEntity<SpaceResponse> create(@Valid @RequestBody SpaceRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(spaceService.create(request));
  }

  @PatchMapping("/{id}")
  public ResponseEntity<SpaceResponse> edit(
      @PathVariable Long id, @Valid @RequestBody SpaceRequest request) {
    return ResponseEntity.ok(spaceService.edit(id, request));
  }
}
