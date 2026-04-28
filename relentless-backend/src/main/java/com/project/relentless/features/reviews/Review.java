package com.project.relentless.features.reviews;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull(message = "Rating is required.")
  @Min(value = 1, message = "Rating must be at least 1.")
  @Max(value = 5, message = "Rating must be at most 5.")
  private int rating;

  @NotBlank(message = "Comment is required.")
  @Size(min = 1, max = 255, message = "Comment must be between 1 and 255 characters.")
  private String comment;

  @NotNull(message = "Time of creation is required.")
  @PastOrPresent(message = "Time of creation must be in the past or present.")
  private LocalDateTime createdAt;
}
