package com.project.relentless.feature.booking.service;

import com.project.relentless.feature.booking.dto.response.ReviewResponse;
import com.project.relentless.feature.booking.mapper.ReviewMapper;
import com.project.relentless.feature.space.repository.SpaceRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

  private final SpaceRepository spaceRepository;
  private final ReviewMapper reviewMapper;

  @Override
  public List<ReviewResponse> getBySpaceId(Long spaceId) {
    var space =
        spaceRepository
            .findById(spaceId)
            .orElseThrow(() -> new EntityNotFoundException("Space not found"));

    return space.getBookings().stream()
        .filter(b -> b.getReview() != null)
        .map(b -> reviewMapper.toReviewResponse(b.getReview()))
        .toList();
  }
}
