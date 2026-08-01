package com.project.relentless.feature.auth.dto.request;

import com.project.relentless.feature.user.validation.Password;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LoginRequest(
    @NotBlank @Size(min = 3, max = 100) @Email String email, @NotNull @Password String password) {}
