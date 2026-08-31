package com.project.relentless.feature.email;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface EmailService {
  void sendOtp(String email, String otp);

  void sendBookingConfirmation(
      String email,
      String username,
      String spaceName,
      LocalDateTime start,
      LocalDateTime end,
      BigDecimal total,
      Long bookingId);
}
