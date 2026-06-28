package com.project.relentless.feature.auth.dto.request;

import com.project.relentless.feature.user.validation.Password;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record RegisterUserRequest(
    @NotBlank @Size(min = 3, max = 50) String username,
    @Password String password,
    @NotBlank @Size(min = 3, max = 100) @Email String email,
    @NotNull @PastOrPresent LocalDate dateOfBirth) {}
