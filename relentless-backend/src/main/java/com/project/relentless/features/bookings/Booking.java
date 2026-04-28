package com.project.relentless.features.bookings;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull(message = "Start time is required.")
  private LocalDateTime startTime;

  @NotNull(message = "End time is required.")
  private LocalDateTime endTime;

  @NotNull(message = "Total price is required.")
  @Positive(message = "Total price must be positive or zero.")
  @Digits(
      integer = 10,
      fraction = 2,
      message = "Total price must be a valid number with up to 2 decimal places.")
  private BigDecimal totalPrice;

  @NotNull(message = "Booking status is required.")
  @Enumerated(EnumType.STRING)
  @Builder.Default
  private BookingStatus status = BookingStatus.PENDING;
}
