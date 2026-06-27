package com.project.relentless.feature.space.dto.projection;

public interface SpaceRatingProjection {
  Long getSpaceId();

  Double getRating();

  Long getReviewCount();
}
