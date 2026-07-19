package com.project.relentless.feature.booking.service;

import com.project.relentless.feature.booking.dto.request.LeaveReviewRequest;
import com.project.relentless.feature.booking.dto.response.ReviewResponse;
import java.util.List;

public interface ReviewService {
  List<ReviewResponse> getBySpaceId(Long spaceId);

  List<ReviewResponse> getHostedByCurrentUser();

  ReviewResponse leave(LeaveReviewRequest request);
}
