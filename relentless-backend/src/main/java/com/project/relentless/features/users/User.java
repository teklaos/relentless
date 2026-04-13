package com.project.relentless.features.users;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;
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
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @NotBlank(message = "Username is required.")
  @Size(min = 1, max = 255, message = "Username must be between 1 and 255 characters.")
  private String username;

  @NotBlank(message = "Password is required.")
  @Size(min = 1, max = 255, message = "Password must be between 1 and 255 characters.")
  private String password;

  @NotBlank(message = "Email is required.")
  @Column(unique = true)
  @Size(min = 1, max = 255, message = "Email must be between 1 and 255 characters.")
  @Email(message = "Invalid email format.")
  private String email;
}
