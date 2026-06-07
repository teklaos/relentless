package com.project.relentless.feature.space.mapper;

import com.project.relentless.feature.space.dto.response.CategoryResponse;
import com.project.relentless.feature.space.entity.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
  CategoryResponse toCategoryResponse(Category category);
}
