package com.project.relentless.feature.user.dto.request;

import com.project.relentless.feature.user.validation.Iban;
import com.project.relentless.feature.user.validation.PhoneNumber;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record EditUserRequest(
    @Size(min = 3, max = 50) String username,
    @Email @Size(min = 3, max = 100) String email,
    @Size(min = 2, max = 100) String firstName,
    @Size(min = 2, max = 100) String lastName,
    @PhoneNumber String phoneNumber,
    @Iban String iban,
    @PastOrPresent LocalDate dateOfBirth,
    @Size(min = 3, max = 255) String profileImageKey) {}
