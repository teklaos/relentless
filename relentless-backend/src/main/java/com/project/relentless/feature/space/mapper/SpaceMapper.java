package com.project.relentless.feature.space.mapper;

import com.project.relentless.feature.space.dto.response.SpaceResponse;
import com.project.relentless.feature.space.dto.response.SpaceSummaryResponse;
import com.project.relentless.feature.space.entity.Space;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SpaceMapper {
  SpaceResponse toSpaceResponse(Space space);

  @Mapping(target = "coverImageKey", expression = "java(coverImageKey(space))")
  @Mapping(target = "city", source = "address.city")
  @Mapping(target = "country", source = "address.country")
  @Mapping(target = "categoryName", source = "category.name")
  SpaceSummaryResponse toSpaceSummaryResponse(Space space);

  default String coverImageKey(Space space) {
    var keys = space.getImageKeys();
    if (keys == null || keys.isEmpty()) {
      return null;
    }
    return keys.getFirst();
  }
}
