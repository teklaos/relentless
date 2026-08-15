package com.project.relentless.feature.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyOtpRequest(
    @NotBlank @Email String email, @NotBlank @Pattern(regexp = "\\d{6}") String otp) {}
