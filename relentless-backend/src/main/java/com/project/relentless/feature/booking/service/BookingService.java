package com.project.relentless.feature.booking.service;

import com.project.relentless.feature.booking.dto.request.CreateBookingRequest;
import com.project.relentless.feature.booking.dto.response.BookingCheckoutResponse;
import com.project.relentless.feature.booking.dto.response.BookingResponse;
import java.util.List;

public interface BookingService {
  List<BookingResponse> getByCurrentUser();

  List<BookingResponse> getHostedByCurrentUser();

  BookingCheckoutResponse create(CreateBookingRequest request);

  void cancelPending();
}
