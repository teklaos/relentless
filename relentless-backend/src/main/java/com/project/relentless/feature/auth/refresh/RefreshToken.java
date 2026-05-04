package com.project.relentless.feature.auth.refresh;

import com.project.relentless.feature.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank(message = "Token hash is required.")
  @Column(unique = true)
  @Size(min = 1, max = 255, message = "Token hash must be between 1 and 255 characters.")
  private String tokenHash;

  @NotNull(message = "Expiration date is required.")
  private Instant expiration;

  @NotNull(message = "User is required.")
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false, updatable = false)
  private User user;
}
