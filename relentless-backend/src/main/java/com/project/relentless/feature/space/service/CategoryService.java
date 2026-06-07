package com.project.relentless.feature.space.service;

import com.project.relentless.feature.space.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {
  List<CategoryResponse> getAll();
}
