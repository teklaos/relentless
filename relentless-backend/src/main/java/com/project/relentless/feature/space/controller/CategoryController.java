package com.project.relentless.feature.space.controller;

import com.project.relentless.feature.space.dto.response.CategoryResponse;
import com.project.relentless.feature.space.service.CategoryService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

  private final CategoryService categoryService;

  @GetMapping
  public ResponseEntity<List<CategoryResponse>> getAll() {
    return ResponseEntity.ok(categoryService.getAll());
  }
}
