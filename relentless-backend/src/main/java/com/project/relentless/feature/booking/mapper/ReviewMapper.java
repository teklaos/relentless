package com.project.relentless.feature.booking.mapper;

import com.project.relentless.feature.booking.dto.response.ReviewResponse;
import com.project.relentless.feature.booking.entity.Review;
import com.project.relentless.feature.space.mapper.SpaceMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
    componentModel = "spring",
    uses = {SpaceMapper.class})
public interface ReviewMapper {

  @Mapping(target = "user", source = "booking.user")
  @Mapping(target = "space", source = "booking.space")
  ReviewResponse toReviewResponse(Review review);
}
