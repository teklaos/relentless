package com.project.relentless.feature.space.entity;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.LocalTime;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkingHours {

  @NotNull(message = "Day of week is required.")
  @Enumerated(EnumType.STRING)
  private DayOfWeek dayOfWeek;

  @NotNull(message = "Open time is required.")
  @Builder.Default
  private LocalTime openTime = LocalTime.of(9, 0);

  @NotNull(message = "Close time is required.")
  @Builder.Default
  private LocalTime closeTime = LocalTime.of(22, 0);
}
