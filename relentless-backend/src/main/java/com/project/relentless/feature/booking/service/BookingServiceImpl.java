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

  @Override
  public List<BookingResponse> getByCurrentUser() {
    Long userId = authService.getCurrentUserId();
    return bookingRepository.findAllByUserId(userId).stream()
        .map(bookingMapper::toBookingResponse)
        .toList();
  }

  @Transactional
  @Override
  public BookingResponse create(CreateBookingRequest request) {
    if (!request.startTime().isBefore(request.endTime())) {
      throw new IllegalArgumentException("Start time must be before end time");
    }

    if (bookingRepository.existsOverlapping(
        request.spaceId(), BookingStatus.CANCELLED, request.startTime(), request.endTime())) {
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

    var minutes = Duration.between(request.startTime(), request.endTime()).toMinutes();
    var durationHours =
        BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
    var totalPrice =
        space.getPricePerHour().multiply(durationHours).setScale(2, RoundingMode.HALF_UP);

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
