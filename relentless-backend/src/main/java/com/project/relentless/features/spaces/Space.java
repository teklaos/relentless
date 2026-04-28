package com.project.relentless.features.spaces;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Space {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank(message = "Name is required.")
  @Size(min = 1, max = 50, message = "Name must be between 1 and 50 characters.")
  private String name;

  @Size(min = 1, max = 255, message = "Description must be between 1 and 255 characters.")
  private String description;

  @NotNull(message = "Price per hour is required.")
  @PositiveOrZero(message = "Price per hour must be positive.")
  @Digits(
      integer = 10,
      fraction = 2,
      message = "Price per hour must be a valid number with up to 2 decimal places.")
  private BigDecimal pricePerHour;

  @NotNull(message = "Publication date is required.")
  @PastOrPresent(message = "Publication date must be in the past or present.")
  private LocalDate publishedOn;
}
