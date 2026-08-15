package com.project.relentless.feature.auth.dto;

import com.project.relentless.feature.user.User;

public record PendingRegistration(User user, String otp) {}
