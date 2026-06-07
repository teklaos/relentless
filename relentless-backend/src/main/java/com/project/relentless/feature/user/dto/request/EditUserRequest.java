package com.project.relentless.feature.user.dto.request;

import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record EditUserRequest(
    @Size(min = 3, max = 50) String username,
    @Size(min = 3, max = 100) String email,
    @PastOrPresent LocalDate dateOfBirth) {}
