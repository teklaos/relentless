package com.project.relentless.feature.space.dto.request;

import com.project.relentless.feature.booking.service.BookingService;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.LocalTime;

public record WorkingHoursRequest(
    @NotNull DayOfWeek dayOfWeek, @NotNull LocalTime openTime, @NotNull LocalTime closeTime) {

  @AssertTrue(message = "must start before it ends")
  public boolean isTimeRangeValid() {
    if (openTime == null || closeTime == null) {
      return true;
    }
    return closeTime.equals(LocalTime.MIDNIGHT) || openTime.isBefore(closeTime);
  }

  @AssertTrue(message = "requires times on " + BookingService.SLOT_MINUTES + "-minute boundaries")
  public boolean isOnSlotBoundary() {
    if (openTime == null || closeTime == null) {
      return true;
    }
    return openTime.getMinute() % BookingService.SLOT_MINUTES == 0
        && closeTime.getMinute() % BookingService.SLOT_MINUTES == 0;
  }
}
