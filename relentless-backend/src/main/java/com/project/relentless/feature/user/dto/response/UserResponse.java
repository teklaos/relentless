package com.project.relentless.feature.user.dto.response;

import java.time.LocalDate;

public record UserResponse(
    Long id,
    String username,
    String email,
    LocalDate dateOfBirth,
    LocalDate dateJoined,
    String profileImageKey,
    String role) {}
