package com.project.relentless.features.users;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "app_user")
@Builder
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank(message = "Username is required.")
  @Size(min = 1, max = 50, message = "Username must be between 1 and 50 characters.")
  private String username;

  @NotBlank(message = "Password hash is required.")
  @Size(min = 1, max = 255, message = "Password hash must be between 1 and 255 characters.")
  private String passwordHash;

  @NotBlank(message = "Email is required.")
  @Column(unique = true)
  @Size(min = 1, max = 255, message = "Email must be between 1 and 75 characters.")
  @Email(message = "Invalid email format.")
  private String email;

  @NotNull(message = "Date of birth is required.")
  @PastOrPresent(message = "Date of birth must be in the past or present.")
  private LocalDate dateOfBirth;

  @NotNull(message = "Role is required.")
  @Enumerated(EnumType.STRING)
  @Builder.Default
  private Role role = Role.USER;
}
