package com.project.relentless.feature.space.service;

import com.project.relentless.feature.space.dto.response.CategoryResponse;
import com.project.relentless.feature.space.mapper.CategoryMapper;
import com.project.relentless.feature.space.repository.CategoryRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

  private final CategoryRepository categoryRepository;
  private final CategoryMapper categoryMapper;

  @Override
  public List<CategoryResponse> getAll() {
    return categoryRepository.findAll().stream().map(categoryMapper::toCategoryResponse).toList();
  }
}
