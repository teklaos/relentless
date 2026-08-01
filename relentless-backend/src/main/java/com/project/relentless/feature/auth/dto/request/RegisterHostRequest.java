package com.project.relentless.feature.auth.dto.request;

import com.project.relentless.feature.user.validation.Iban;
import com.project.relentless.feature.user.validation.Password;
import com.project.relentless.feature.user.validation.PhoneNumber;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record RegisterHostRequest(
    @NotBlank @Size(min = 3, max = 50) String username,
    @NotNull @Password String password,
    @NotBlank @Size(min = 3, max = 100) @Email String email,
    @NotNull @PastOrPresent LocalDate dateOfBirth,
    @NotBlank @Size(min = 2, max = 255) String firstName,
    @NotBlank @Size(min = 2, max = 255) String lastName,
    @NotNull @PhoneNumber String phoneNumber,
    @NotNull @Iban String iban,
    @AssertTrue boolean acceptedTerms) {}
