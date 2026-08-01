package com.project.relentless.feature.user.dto.response;

import java.time.LocalDate;

public record UserResponse(
    Long id,
    String username,
    String email,
    String firstName,
    String lastName,
    String phoneNumber,
    String iban,
    LocalDate dateOfBirth,
    LocalDate dateJoined,
    String profileImageKey,
    String role) {}
