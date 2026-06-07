package com.project.relentless.feature.space.mapper;

import com.project.relentless.feature.space.dto.response.SpaceResponse;
import com.project.relentless.feature.space.dto.response.SpaceSummaryResponse;
import com.project.relentless.feature.space.entity.Space;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SpaceMapper {

  @Mapping(target = "rating", expression = "java(computeRating(space))")
  @Mapping(target = "reviewCount", expression = "java(computeReviewCount(space))")
  SpaceResponse toSpaceResponse(Space space);

  @Mapping(target = "city", source = "address.city")
  @Mapping(target = "country", source = "address.country")
  @Mapping(target = "categoryName", source = "category.name")
  SpaceSummaryResponse toSpaceSummaryResponse(Space space);

  default double computeRating(Space space) {
    return space.getBookings().stream()
        .filter(b -> b.getReview() != null)
        .mapToDouble(b -> b.getReview().getRating())
        .average()
        .orElse(0.0);
  }

  default int computeReviewCount(Space space) {
    return space.getBookings().stream().filter(b -> b.getReview() != null).mapToInt(_ -> 1).sum();
  }
}
