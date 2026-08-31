package com.project.relentless.feature.booking.service;

import com.project.relentless.feature.auth.AuthService;
import com.project.relentless.feature.booking.BookingStatus;
import com.project.relentless.feature.booking.dto.request.CreateBookingRequest;
import com.project.relentless.feature.booking.dto.response.BookingCheckoutResponse;
import com.project.relentless.feature.booking.dto.response.BookingResponse;
import com.project.relentless.feature.booking.entity.Booking;
import com.project.relentless.feature.booking.mapper.BookingMapper;
import com.project.relentless.feature.booking.repository.BookingRepository;
import com.project.relentless.feature.payment.PaymentService;
import com.project.relentless.feature.space.SpaceStatus;
import com.project.relentless.feature.space.repository.SpaceRepository;
import com.project.relentless.feature.user.UserRepository;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

  private final BookingRepository bookingRepository;
  private final BookingMapper bookingMapper;
  private final UserRepository userRepository;
  private final SpaceRepository spaceRepository;
  private final AuthService authService;
  private final PaymentService paymentService;

  private static final int CANCEL_DELAY_MINUTES = 5;

  @Override
  @PreAuthorize("hasRole('TENANT')")
  public List<BookingResponse> getByCurrentUser() {
    Long userId = authService.getCurrentUserId();
    return bookingRepository.findAllByUserId(userId).stream()
        .map(bookingMapper::toBookingResponse)
        .toList();
  }

  @Override
  @PreAuthorize("hasRole('HOST')")
  public List<BookingResponse> getHostedByCurrentUser() {
    Long userId = authService.getCurrentUserId();
    return bookingRepository.findAllBySpaceHostId(userId).stream()
        .map(bookingMapper::toBookingResponse)
        .toList();
  }

  @Override
  @PreAuthorize("hasRole('TENANT')")
  public BookingCheckoutResponse getById(Long id) {
    var booking =
        bookingRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

    Long userId = authService.getCurrentUserId();
    if (!booking.getUser().getId().equals(userId)) {
      throw new AuthorizationDeniedException("You are not allowed to access this booking");
    }

    if (booking.getStatus() == BookingStatus.PENDING
        && booking
            .getCreatedAt()
            .isBefore(
                Instant.now()
                    .minus(
                        Duration.ofMinutes(PaymentService.CHECKOUT_SESSION_EXPIRATION_MINUTES)))) {
      booking.setCheckoutSessionUrl(null);
    }

    return bookingMapper.toBookingCheckoutResponse(booking);
  }

  @Override
  @Transactional
  @PreAuthorize("hasRole('TENANT')")
  public BookingCheckoutResponse create(CreateBookingRequest request) {
    if (!request.startTime().isBefore(request.endTime())) {
      throw new IllegalArgumentException("Start time must be before end time");
    }

    if (request.startTime().isBefore(LocalDateTime.now().plusHours(MIN_BOOKING_LEAD_HOURS))) {
      throw new IllegalArgumentException(
          "Start time must be at least " + MIN_BOOKING_LEAD_HOURS + " hours from now");
    }

    if (bookingRepository.existsBySpaceIdAndStatusNotAndStartTimeBeforeAndEndTimeAfter(
        request.spaceId(), BookingStatus.CANCELLED, request.endTime(), request.startTime())) {
      throw new EntityExistsException("Space already booked for the chosen time");
    }

    if (request.startTime().getMinute() % SLOT_MINUTES != 0
        || request.endTime().getMinute() % SLOT_MINUTES != 0) {
      throw new IllegalArgumentException(
          "Start and end time must be within " + SLOT_MINUTES + "-minute slots");
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

    if (!space.getStatus().equals(SpaceStatus.ACTIVE)) {
      throw new IllegalArgumentException("Space is not available for booking");
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

    var saved = bookingRepository.save(booking);
    var session = paymentService.createCheckoutSession(saved);
    saved.setCheckoutSessionUrl(session.getUrl());

    return bookingMapper.toBookingCheckoutResponse(saved);
  }

  @Override
  @Transactional
  public void cancelPending() {
    var bookings =
        bookingRepository.findAllByStatusAndCreatedAtBefore(
            BookingStatus.PENDING,
            Instant.now()
                .minus(
                    Duration.ofMinutes(
                        PaymentService.CHECKOUT_SESSION_EXPIRATION_MINUTES
                            + CANCEL_DELAY_MINUTES)));
    for (var booking : bookings) {
      booking.setStatus(BookingStatus.CANCELLED);
      bookingRepository.save(booking);
    }
  }

  @Override
  @Transactional
  public void completeFinished() {
    var bookings =
        bookingRepository.findAllByStatusAndEndTimeBefore(
            BookingStatus.CONFIRMED, LocalDateTime.now());
    for (var booking : bookings) {
      booking.setStatus(BookingStatus.COMPLETED);
      bookingRepository.save(booking);
    }
  }
}
