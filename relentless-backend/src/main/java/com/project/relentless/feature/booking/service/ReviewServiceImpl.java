package com.project.relentless.feature.booking.service;

import com.project.relentless.feature.auth.AuthService;
import com.project.relentless.feature.booking.BookingStatus;
import com.project.relentless.feature.booking.dto.request.LeaveReviewRequest;
import com.project.relentless.feature.booking.dto.response.ReviewResponse;
import com.project.relentless.feature.booking.entity.Review;
import com.project.relentless.feature.booking.mapper.ReviewMapper;
import com.project.relentless.feature.booking.repository.BookingRepository;
import com.project.relentless.feature.booking.repository.ReviewRepository;
import com.project.relentless.feature.space.repository.SpaceRepository;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

  private final ReviewRepository reviewRepository;
  private final ReviewMapper reviewMapper;
  private final SpaceRepository spaceRepository;
  private final BookingRepository bookingRepository;
  private final AuthService authService;

  @Override
  public List<ReviewResponse> getBySpaceId(Long spaceId) {
    if (!spaceRepository.existsById(spaceId)) {
      throw new EntityNotFoundException("Space not found");
    }

    return reviewRepository.findBySpaceId(spaceId).stream()
        .map(reviewMapper::toReviewResponse)
        .toList();
  }

  @Override
  @PreAuthorize("hasRole('HOST')")
  public List<ReviewResponse> getHostedByCurrentUser() {
    Long userId = authService.getCurrentUserId();

    return reviewRepository.findByHostId(userId).stream()
        .map(reviewMapper::toReviewResponse)
        .toList();
  }

  @Override
  @Transactional
  @PreAuthorize("hasRole('TENANT')")
  public ReviewResponse leave(LeaveReviewRequest request) {
    Long userId = authService.getCurrentUserId();

    var booking =
        bookingRepository
            .findById(request.bookingId())
            .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

    if (!booking.getUser().getId().equals(userId)) {
      throw new AuthorizationDeniedException("You are not allowed to review this booking");
    }

    if (booking.getReview() != null) {
      throw new EntityExistsException("Booking already reviewed");
    }

    if (booking.getStatus() != BookingStatus.COMPLETED) {
      throw new IllegalArgumentException("Booking is not completed");
    }

    var review =
        Review.builder()
            .booking(booking)
            .rating(request.rating())
            .comment(request.comment())
            .createdAt(Instant.now())
            .build();

    var saved = reviewRepository.save(review);

    var space = booking.getSpace();

    int newReviewCount = space.getReviewCount() + 1;
    double newRating =
        (space.getRating() * space.getReviewCount() + saved.getRating()) / newReviewCount;

    space.setReviewCount(newReviewCount);
    space.setRating(newRating);

    spaceRepository.save(space);

    return reviewMapper.toReviewResponse(saved);
  }
}
