package com.project.relentless.feature.space.service;

import com.project.relentless.feature.auth.AuthService;
import com.project.relentless.feature.space.dto.response.SpaceResponse;
import com.project.relentless.feature.space.mapper.SpaceMapper;
import com.project.relentless.feature.space.repository.SpaceRepository;
import com.project.relentless.feature.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SpaceServiceImpl implements SpaceService {

  private final SpaceRepository spaceRepository;
  private final SpaceMapper spaceMapper;
  private final UserRepository userRepository;
  private final AuthService authService;

  @Override
  public List<SpaceResponse> getAll() {
    return spaceRepository.findAll().stream().map(spaceMapper::toSpaceResponse).toList();
  }

  @Override
  public List<SpaceResponse> getSavedByCurrentUser() {
    Long userId = authService.getCurrentUserId();
    return spaceRepository.findSavedByUserId(userId).stream()
        .map(spaceMapper::toSpaceResponse)
        .toList();
  }

  @Override
  public SpaceResponse getById(Long id) {
    var space =
        spaceRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Space not found"));

    return spaceMapper.toSpaceResponse(space);
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
}
