package com.project.relentless.feature.booking.mapper;

import com.project.relentless.feature.booking.dto.response.ReviewResponse;
import com.project.relentless.feature.booking.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

  @Mapping(target = "author", source = "booking.user")
  ReviewResponse toReviewResponse(Review review);
}
