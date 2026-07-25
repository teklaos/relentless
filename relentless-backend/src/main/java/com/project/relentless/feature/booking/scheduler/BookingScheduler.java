package com.project.relentless.feature.booking.scheduler;

import com.project.relentless.feature.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookingScheduler {

  private final BookingService bookingService;

  @Scheduled(cron = "0 */5 * * * *")
  public void cancelPending() {
    bookingService.cancelPending();
  }
}
