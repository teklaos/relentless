package com.project.relentless.features.bookings;

import com.project.relentless.features.spaces.Space;
import com.project.relentless.features.users.User;
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

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, updatable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "space_id", nullable = false, updatable = false)
  private Space space;

  @OneToOne(mappedBy = "booking", cascade = CascadeType.REMOVE, orphanRemoval = true)
  private Review review;
}
