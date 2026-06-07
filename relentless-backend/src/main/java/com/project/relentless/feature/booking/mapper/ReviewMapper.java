package com.project.relentless.feature.booking.mapper;

import com.project.relentless.feature.booking.dto.response.ReviewResponse;
import com.project.relentless.feature.booking.entity.Review;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
  ReviewResponse toReviewResponse(Review review);
}
