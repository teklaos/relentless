package com.project.relentless.feature.booking.service;

import com.project.relentless.feature.booking.dto.request.CreateBookingRequest;
import com.project.relentless.feature.booking.dto.response.BookingCheckoutResponse;
import com.project.relentless.feature.booking.dto.response.BookingResponse;
import java.util.List;

public interface BookingService {
  int SLOT_MINUTES = 30;

  int MIN_BOOKING_LEAD_HOURS = 2;

  List<BookingResponse> getByCurrentUser();

  List<BookingResponse> getHostedByCurrentUser();

  BookingCheckoutResponse getById(Long id);

  BookingCheckoutResponse create(CreateBookingRequest request);

  void cancelPending();

  void completeFinished();
}
