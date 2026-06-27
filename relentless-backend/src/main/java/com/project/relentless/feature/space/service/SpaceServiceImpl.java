package com.project.relentless.feature.space.service;

import com.project.relentless.feature.auth.AuthService;
import com.project.relentless.feature.booking.repository.ReviewRepository;
import com.project.relentless.feature.space.dto.projection.SpaceRatingProjection;
import com.project.relentless.feature.space.dto.response.SpaceResponse;
import com.project.relentless.feature.space.entity.Space;
import com.project.relentless.feature.space.mapper.SpaceMapper;
import com.project.relentless.feature.space.repository.SpaceRepository;
import com.project.relentless.feature.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SpaceServiceImpl implements SpaceService {

  private final SpaceRepository spaceRepository;
  private final SpaceMapper spaceMapper;
  private final ReviewRepository reviewRepository;
  private final UserRepository userRepository;
  private final AuthService authService;

  @Override
  public List<SpaceResponse> getAll() {
    var stats = toStatsMap(reviewRepository.findRatingStats());
    return spaceRepository.findAll().stream().map(space -> toResponse(space, stats)).toList();
  }

  @Override
  public List<SpaceResponse> getSavedByCurrentUser() {
    Long userId = authService.getCurrentUserId();
    var stats = toStatsMap(reviewRepository.findRatingStats());
    return spaceRepository.findSavedByUserId(userId).stream()
        .map(space -> toResponse(space, stats))
        .toList();
  }

  @Override
  public SpaceResponse getById(Long id) {
    var space =
        spaceRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Space not found"));

    var stats = toStatsMap(reviewRepository.findRatingStatsBySpaceId(id));
    return toResponse(space, stats);
  }

  @Override
  public void save(Long id) {
    Long userId = authService.getCurrentUserId();
    var user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
    var space =
        spaceRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Space not found"));

    user.getSavedSpaces().add(space);
    userRepository.save(user);
  }

  @Override
  public void unsave(Long id) {
    Long userId = authService.getCurrentUserId();
    var user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
    var space =
        spaceRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Space not found"));

    user.getSavedSpaces().remove(space);
    userRepository.save(user);
  }

  private Map<Long, SpaceRatingProjection> toStatsMap(List<SpaceRatingProjection> stats) {
    return stats.stream()
        .collect(Collectors.toMap(SpaceRatingProjection::getSpaceId, Function.identity()));
  }

  private SpaceResponse toResponse(Space space, Map<Long, SpaceRatingProjection> stats) {
    var stat = stats.get(space.getId());
    double rating = stat != null && stat.getRating() != null ? stat.getRating() : 0.0;
    int reviewCount = stat != null ? stat.getReviewCount().intValue() : 0;
    return spaceMapper.toSpaceResponse(space, rating, reviewCount);
  }
}
