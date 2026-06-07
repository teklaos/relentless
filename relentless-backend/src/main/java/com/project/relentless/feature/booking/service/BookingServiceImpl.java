package com.project.relentless.feature.booking.service;

import com.project.relentless.feature.auth.AuthService;
import com.project.relentless.feature.booking.dto.response.BookingResponse;
import com.project.relentless.feature.booking.mapper.BookingMapper;
import com.project.relentless.feature.booking.repository.BookingRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

  private final BookingRepository bookingRepository;
  private final BookingMapper bookingMapper;
  private final AuthService authService;

  @Override
  public List<BookingResponse> getByCurrentUser() {
    Long userId = authService.getCurrentUserId();
    return bookingRepository.findAllByUserId(userId).stream()
        .map(bookingMapper::toBookingResponse)
        .toList();
  }
}
