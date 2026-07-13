package com.project.relentless.feature.space.controller;

import static org.springframework.format.annotation.DateTimeFormat.ISO.DATE;

import com.project.relentless.feature.space.dto.request.CreateSpaceRequest;
import com.project.relentless.feature.space.dto.request.EditSpaceRequest;
import com.project.relentless.feature.space.dto.request.SpaceStatusRequest;
import com.project.relentless.feature.space.dto.response.SpaceResponse;
import com.project.relentless.feature.space.dto.response.TimeSlotResponse;
import com.project.relentless.feature.space.service.SpaceService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
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

  @GetMapping("/{id}/availability")
  public ResponseEntity<List<TimeSlotResponse>> getAvailabilityById(
      @PathVariable Long id, @RequestParam @DateTimeFormat(iso = DATE) LocalDate date) {
    return ResponseEntity.ok(spaceService.getAvailabilityById(id, date));
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
  public ResponseEntity<SpaceResponse> create(@Valid @RequestBody CreateSpaceRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(spaceService.create(request));
  }

  @PatchMapping("/{id}")
  public ResponseEntity<SpaceResponse> edit(
      @PathVariable Long id, @Valid @RequestBody EditSpaceRequest request) {
    return ResponseEntity.ok(spaceService.edit(id, request));
  }

  @PatchMapping("/{id}/status")
  public ResponseEntity<SpaceResponse> changeStatus(
      @PathVariable Long id, @Valid @RequestBody SpaceStatusRequest request) {
    return ResponseEntity.ok(spaceService.changeStatus(id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    spaceService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
