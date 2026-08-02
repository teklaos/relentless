package com.project.relentless.feature.user.dto.response;

import java.time.LocalDate;

public record AdminUserResponse(
    Long id,
    String username,
    String email,
    String firstName,
    String lastName,
    String phoneNumber,
    LocalDate dateOfBirth,
    LocalDate dateJoined,
    String profileImageKey,
    String role) {}
