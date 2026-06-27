package com.project.relentless.feature.space.mapper;

import com.project.relentless.feature.space.dto.response.SpaceResponse;
import com.project.relentless.feature.space.dto.response.SpaceSummaryResponse;
import com.project.relentless.feature.space.entity.Space;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SpaceMapper {

  @Mapping(target = "rating", source = "rating")
  @Mapping(target = "reviewCount", source = "reviewCount")
  SpaceResponse toSpaceResponse(Space space, double rating, int reviewCount);

  @Mapping(target = "city", source = "address.city")
  @Mapping(target = "country", source = "address.country")
  @Mapping(target = "categoryName", source = "category.name")
  SpaceSummaryResponse toSpaceSummaryResponse(Space space);
}
