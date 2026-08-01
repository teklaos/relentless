package com.project.relentless.feature.user.dto.request;

import com.project.relentless.feature.user.validation.Password;

public record ChangePasswordRequest(
    @Password String currentPassword, @Password String newPassword) {}
