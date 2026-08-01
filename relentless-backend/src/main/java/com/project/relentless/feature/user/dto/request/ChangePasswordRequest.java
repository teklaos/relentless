package com.project.relentless.feature.user.dto.request;

import com.project.relentless.feature.user.validation.Password;
import jakarta.validation.constraints.NotNull;

public record ChangePasswordRequest(
    @NotNull @Password String currentPassword, @NotNull @Password String newPassword) {}
