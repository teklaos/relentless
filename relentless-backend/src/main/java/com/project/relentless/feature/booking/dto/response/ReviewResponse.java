package com.project.relentless.feature.booking.dto.response;

import java.time.LocalDateTime;

public record ReviewResponse(Long id, int rating, String comment, LocalDateTime createdAt) {}
