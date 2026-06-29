package com.project.relentless.feature.space.service;

import com.project.relentless.feature.auth.AuthService;
import com.project.relentless.feature.space.dto.request.SpaceRequest;
import com.project.relentless.feature.space.dto.response.SpaceResponse;
import com.project.relentless.feature.space.entity.Space;
import com.project.relentless.feature.space.mapper.AddressMapper;
import com.project.relentless.feature.space.mapper.SpaceMapper;
import com.project.relentless.feature.space.repository.AmenityRepository;
import com.project.relentless.feature.space.repository.CategoryRepository;
import com.project.relentless.feature.space.repository.SpaceRepository;
import com.project.relentless.feature.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.util.HashSet;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SpaceServiceImpl implements SpaceService {

  private final SpaceRepository spaceRepository;
  private final SpaceMapper spaceMapper;
  private final UserRepository userRepository;
  private final CategoryRepository categoryRepository;
  private final AmenityRepository amenityRepository;
  private final AddressMapper addressMapper;
  private final AuthService authService;

  @Override
  public List<SpaceResponse> getAll() {
    return spaceRepository.findAllByIsDeletedFalse().stream()
        .map(spaceMapper::toSpaceResponse)
        .toList();
  }

  @Override
  public List<SpaceResponse> getSavedByCurrentUser() {
    Long userId = authService.getCurrentUserId();
    return spaceRepository.findBySavedByIdAndIsDeletedFalse(userId).stream()
        .map(spaceMapper::toSpaceResponse)
        .toList();
  }

  @Override
  public List<SpaceResponse> getHostedByCurrentUser() {
    Long userId = authService.getCurrentUserId();
    return spaceRepository.findByHostIdAndIsDeletedFalse(userId).stream()
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

  @Override
  @Transactional
  public SpaceResponse create(SpaceRequest request) {
    Long userId = authService.getCurrentUserId();
    var user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

    var category =
        categoryRepository
            .findById(request.categoryId())
            .orElseThrow(() -> new EntityNotFoundException("Category not found"));

    var amenities = amenityRepository.findAllById(request.amenityIds());

    if (amenities.size() != request.amenityIds().size()) {
      throw new EntityNotFoundException("Amenity not found");
    }

    var space =
        Space.builder()
            .name(request.name())
            .description(request.description())
            .address(addressMapper.toAddress(request.address()))
            .pricePerHour(request.pricePerHour())
            .imageKeys(request.imageKeys())
            .host(user)
            .category(category)
            .amenities(new HashSet<>(amenities))
            .build();

    return spaceMapper.toSpaceResponse(spaceRepository.save(space));
  }

  @Override
  @Transactional
  public SpaceResponse edit(Long id, SpaceRequest request) {
    var space =
        spaceRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Space not found"));

    Long userId = authService.getCurrentUserId();
    var user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

    if (!space.getHost().getId().equals(user.getId())) {
      throw new AuthorizationDeniedException("You are not allowed to edit this space");
    }

    if (request.name() != null) space.setName(request.name());
    if (request.description() != null) space.setDescription(request.description());
    if (request.address() != null) space.setAddress(addressMapper.toAddress(request.address()));
    if (request.pricePerHour() != null) space.setPricePerHour(request.pricePerHour());
    if (request.imageKeys() != null) space.setImageKeys(request.imageKeys());

    if (request.categoryId() != null) {
      var category =
          categoryRepository
              .findById(request.categoryId())
              .orElseThrow(() -> new EntityNotFoundException("Category not found"));

      space.setCategory(category);
    }
    if (request.amenityIds() != null) {
      var amenities = amenityRepository.findAllById(request.amenityIds());

      if (amenities.size() != request.amenityIds().size()) {
        throw new EntityNotFoundException("Amenity not found");
      }

      space.setAmenities(new HashSet<>(amenities));
    }

    return spaceMapper.toSpaceResponse(spaceRepository.save(space));
  }
}
