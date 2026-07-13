package com.project.relentless.feature.booking.service;

import com.project.relentless.feature.auth.AuthService;
import com.project.relentless.feature.booking.BookingStatus;
import com.project.relentless.feature.booking.dto.request.CreateBookingRequest;
import com.project.relentless.feature.booking.dto.response.BookingResponse;
import com.project.relentless.feature.booking.entity.Booking;
import com.project.relentless.feature.booking.mapper.BookingMapper;
import com.project.relentless.feature.booking.repository.BookingRepository;
import com.project.relentless.feature.space.repository.SpaceRepository;
import com.project.relentless.feature.user.UserRepository;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

  private final BookingRepository bookingRepository;
  private final BookingMapper bookingMapper;
  private final UserRepository userRepository;
  private final SpaceRepository spaceRepository;
  private final AuthService authService;

  private static final int SLOT_MINUTES = 30;

  @Override
  public List<BookingResponse> getByCurrentUser() {
    Long userId = authService.getCurrentUserId();
    return bookingRepository.findAllByUserId(userId).stream()
        .map(bookingMapper::toBookingResponse)
        .toList();
  }

  @Override
  public List<BookingResponse> getHostedByCurrentUser() {
    Long userId = authService.getCurrentUserId();
    return bookingRepository.findAllBySpaceHostId(userId).stream()
        .map(bookingMapper::toBookingResponse)
        .toList();
  }

  @Override
  @Transactional
  public BookingResponse create(CreateBookingRequest request) {
    if (!request.startTime().isBefore(request.endTime())) {
      throw new IllegalArgumentException("Start time must be before end time");
    }

    if (bookingRepository.existsBySpaceIdAndStatusNotAndStartTimeBeforeAndEndTimeAfter(
        request.spaceId(), BookingStatus.CANCELLED, request.endTime(), request.startTime())) {
      throw new EntityExistsException("Space already booked for the chosen time");
    }

    var userId = authService.getCurrentUserId();
    var user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

    var space =
        spaceRepository
            .findById(request.spaceId())
            .orElseThrow(() -> new EntityNotFoundException("Space not found"));

    if (request.startTime().getMinute() % SLOT_MINUTES != 0
        || request.endTime().getMinute() % SLOT_MINUTES != 0) {
      throw new IllegalArgumentException(
          "Start and end time must be within " + SLOT_MINUTES + "-minute slots");
    }

    var hours =
        space.getWorkingHours().stream()
            .filter(wh -> wh.getDayOfWeek() == request.startTime().getDayOfWeek())
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Space is closed on this day"));

    var date = request.startTime().toLocalDate();
    var openDateTime = date.atTime(hours.getOpenTime());
    var closeDateTime = date.atTime(hours.getCloseTime());

    if (hours.getCloseTime().equals(LocalTime.MIDNIGHT)) {
      closeDateTime = date.plusDays(1).atStartOfDay();
    }

    if (request.startTime().isBefore(openDateTime) || request.endTime().isAfter(closeDateTime)) {
      throw new IllegalArgumentException("Booking time must be within working hours");
    }

    var minutes = Duration.between(request.startTime(), request.endTime()).toMinutes();
    var totalPrice =
        space
            .getPricePerHour()
            .multiply(BigDecimal.valueOf(minutes))
            .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

    var booking =
        Booking.builder()
            .user(user)
            .space(space)
            .startTime(request.startTime())
            .endTime(request.endTime())
            .totalPrice(totalPrice)
            .build();

    return bookingMapper.toBookingResponse(bookingRepository.save(booking));
  }
}
