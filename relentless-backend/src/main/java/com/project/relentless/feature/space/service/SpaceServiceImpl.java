package com.project.relentless.feature.space.service;

import com.project.relentless.feature.auth.AuthService;
import com.project.relentless.feature.booking.BookingStatus;
import com.project.relentless.feature.booking.repository.BookingRepository;
import com.project.relentless.feature.image.ImageService;
import com.project.relentless.feature.space.SpaceStatus;
import com.project.relentless.feature.space.dto.request.CreateSpaceRequest;
import com.project.relentless.feature.space.dto.request.EditSpaceRequest;
import com.project.relentless.feature.space.dto.request.SpaceStatusRequest;
import com.project.relentless.feature.space.dto.response.DayAvailabilityResponse;
import com.project.relentless.feature.space.dto.response.SpaceResponse;
import com.project.relentless.feature.space.dto.response.TimeSlotResponse;
import com.project.relentless.feature.space.entity.Space;
import com.project.relentless.feature.space.mapper.AddressMapper;
import com.project.relentless.feature.space.mapper.SpaceMapper;
import com.project.relentless.feature.space.mapper.WorkingHoursMapper;
import com.project.relentless.feature.space.repository.AmenityRepository;
import com.project.relentless.feature.space.repository.CategoryRepository;
import com.project.relentless.feature.space.repository.SpaceRepository;
import com.project.relentless.feature.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpaceServiceImpl implements SpaceService {

  private final SpaceRepository spaceRepository;
  private final SpaceMapper spaceMapper;
  private final BookingRepository bookingRepository;
  private final UserRepository userRepository;
  private final CategoryRepository categoryRepository;
  private final AmenityRepository amenityRepository;
  private final AddressMapper addressMapper;
  private final AuthService authService;
  private final WorkingHoursMapper workingHoursMapper;
  private final ImageService imageService;

  private static final int SLOT_MINUTES = 30;
  private static final int MIN_BOOKING_LEAD_HOURS = 2;

  @Override
  public List<SpaceResponse> getAll() {
    return spaceRepository.findAllByStatus(SpaceStatus.ACTIVE).stream()
        .map(spaceMapper::toSpaceResponse)
        .toList();
  }

  @Override
  @PreAuthorize("hasRole('TENANT')")
  public List<SpaceResponse> getSavedByCurrentUser() {
    Long userId = authService.getCurrentUserId();
    return spaceRepository.findAllBySavedByIdAndStatus(userId, SpaceStatus.ACTIVE).stream()
        .map(spaceMapper::toSpaceResponse)
        .toList();
  }

  @Override
  @PreAuthorize("hasRole('HOST')")
  public List<SpaceResponse> getHostedByCurrentUser() {
    Long userId = authService.getCurrentUserId();
    return spaceRepository.findAllByHostIdAndStatusNot(userId, SpaceStatus.DELETED).stream()
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
  public List<TimeSlotResponse> getAvailabilityById(Long id, LocalDate date) {
    var space =
        spaceRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Space not found"));

    if (!space.getStatus().equals(SpaceStatus.ACTIVE)) {
      return List.of();
    }

    var hours =
        space.getWorkingHours().stream()
            .filter(wh -> wh.getDayOfWeek() == date.getDayOfWeek())
            .findFirst()
            .orElse(null);

    if (hours == null) {
      return List.of();
    }

    var openDateTime = date.atTime(hours.getOpenTime());
    var closeDateTime = date.atTime(hours.getCloseTime());

    if (hours.getCloseTime().equals(LocalTime.MIDNIGHT)) {
      closeDateTime = date.plusDays(1).atStartOfDay();
    }

    var bookings =
        bookingRepository.findAllBySpaceIdAndStatusNotAndStartTimeBeforeAndEndTimeAfter(
            id, BookingStatus.CANCELLED, closeDateTime, openDateTime);

    var earliestStart = LocalDateTime.now().plusHours(MIN_BOOKING_LEAD_HOURS);
    var availableSlots = new ArrayList<TimeSlotResponse>();
    for (var start = openDateTime;
        start.isBefore(closeDateTime);
        start = start.plusMinutes(SLOT_MINUTES)) {
      var slotStart = start;
      var slotEnd = start.plusMinutes(SLOT_MINUTES);

      if (slotEnd.isAfter(closeDateTime)) {
        break;
      }

      boolean isAvailable =
          !slotStart.isBefore(earliestStart)
              && bookings.stream()
                  .noneMatch(
                      b -> b.getStartTime().isBefore(slotEnd) && b.getEndTime().isAfter(slotStart));

      availableSlots.add(
          new TimeSlotResponse(slotStart.toLocalTime(), slotEnd.toLocalTime(), isAvailable));
    }

    return availableSlots;
  }

  @Override
  public List<DayAvailabilityResponse> getMonthAvailabilityById(Long id, YearMonth month) {
    var availableDays = new ArrayList<DayAvailabilityResponse>();

    for (var date = month.atDay(1); !date.isAfter(month.atEndOfMonth()); date = date.plusDays(1)) {
      boolean isAvailable =
          !date.isBefore(LocalDate.now())
              && getAvailabilityById(id, date).stream().anyMatch(TimeSlotResponse::isAvailable);
      availableDays.add(new DayAvailabilityResponse(date, isAvailable));
    }

    return availableDays;
  }

  @Override
  @Transactional
  @PreAuthorize("hasRole('TENANT')")
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

    if (!space.getStatus().equals(SpaceStatus.ACTIVE)) {
      throw new EntityNotFoundException("Space not found");
    }

    user.getSavedSpaces().add(space);
    userRepository.save(user);
  }

  @Override
  @Transactional
  @PreAuthorize("hasRole('TENANT')")
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

    if (!space.getStatus().equals(SpaceStatus.ACTIVE)) {
      throw new EntityNotFoundException("Space not found");
    }

    user.getSavedSpaces().remove(space);
    userRepository.save(user);
  }

  @Override
  @Transactional
  @PreAuthorize("hasRole('HOST')")
  public SpaceResponse create(CreateSpaceRequest request) {
    Long userId = authService.getCurrentUserId();
    var user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

    var category =
        categoryRepository
            .findById(request.categoryId())
            .orElseThrow(() -> new EntityNotFoundException("Category not found"));

    var amenityIds = request.amenityIds();
    if (amenityIds == null) {
      amenityIds = Set.of();
    }

    var amenities = amenityRepository.findAllById(amenityIds);
    if (amenities.size() != amenityIds.size()) {
      throw new EntityNotFoundException("Amenity not found");
    }

    var space =
        Space.builder()
            .name(request.name())
            .description(request.description())
            .address(addressMapper.toAddress(request.address()))
            .pricePerHour(request.pricePerHour())
            .workingHours(workingHoursMapper.toWorkingHours(request.workingHours()))
            .imageKeys(request.imageKeys())
            .host(user)
            .category(category)
            .amenities(new HashSet<>(amenities))
            .build();

    return spaceMapper.toSpaceResponse(spaceRepository.save(space));
  }

  @Override
  @Transactional
  @PreAuthorize("hasRole('HOST')")
  public SpaceResponse edit(Long id, EditSpaceRequest request) {
    var space = getOwnedSpaceByIdOrThrow(id, "You are not allowed to edit this space");

    if (space.getStatus().equals(SpaceStatus.DELETED)) {
      throw new EntityNotFoundException("Space not found");
    }

    if (request.name() != null) {
      space.setName(request.name());
    }
    if (request.description() != null) {
      space.setDescription(request.description());
    }
    if (request.address() != null) {
      space.setAddress(addressMapper.toAddress(request.address()));
    }
    if (request.pricePerHour() != null) {
      space.setPricePerHour(request.pricePerHour());
    }
    if (request.workingHours() != null) {
      space.setWorkingHours(workingHoursMapper.toWorkingHours(request.workingHours()));
    }
    if (request.imageKeys() != null) {
      List<String> oldKeys = new ArrayList<>(space.getImageKeys());
      oldKeys.removeAll(request.imageKeys());
      space.setImageKeys(request.imageKeys());
      for (String key : oldKeys) {
        try {
          imageService.deleteByKey(key);
        } catch (Exception ex) {
          log.warn("Failed to delete orphaned image {}: {}", key, ex.getMessage());
        }
      }
    }

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

  @Override
  @Transactional
  @PreAuthorize("hasRole('HOST')")
  public SpaceResponse changeStatus(Long id, SpaceStatusRequest request) {
    if (request.status() == SpaceStatus.DELETED) {
      throw new IllegalArgumentException("Cannot change status to DELETED");
    }

    var space =
        getOwnedSpaceByIdOrThrow(id, "You are not allowed to change the status of this space");

    if (space.getStatus().equals(SpaceStatus.DELETED)) {
      throw new EntityNotFoundException("Space not found");
    }

    space.setStatus(request.status());
    return spaceMapper.toSpaceResponse(spaceRepository.save(space));
  }

  @Override
  @Transactional
  @PreAuthorize("hasRole('HOST')")
  public void delete(Long id) {
    var space = getOwnedSpaceByIdOrThrow(id, "You are not allowed to delete this space");
    space.setStatus(SpaceStatus.DELETED);
    spaceRepository.save(space);
  }

  @Override
  @Transactional
  @PreAuthorize("hasRole('HOST')")
  public void deleteHostedByCurrentUser() {
    Long userId = authService.getCurrentUserId();
    var spaces = spaceRepository.findAllByHostIdAndStatusNot(userId, SpaceStatus.DELETED);
    for (var space : spaces) {
      space.setStatus(SpaceStatus.DELETED);
      spaceRepository.save(space);
    }
  }

  private Space getOwnedSpaceByIdOrThrow(Long id, String message) {
    var space =
        spaceRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Space not found"));

    Long userId = authService.getCurrentUserId();
    if (!space.getHost().getId().equals(userId)) {
      throw new AuthorizationDeniedException(message);
    }

    return space;
  }
}
