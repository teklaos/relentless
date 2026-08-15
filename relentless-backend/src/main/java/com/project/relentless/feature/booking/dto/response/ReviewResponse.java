package com.project.relentless.feature.booking.dto.response;

import com.project.relentless.feature.space.dto.response.SpaceSummaryResponse;
import com.project.relentless.feature.user.dto.response.UserSummaryResponse;
import java.time.LocalDateTime;

public record ReviewResponse(
    Long id,
    int rating,
    String comment,
    LocalDateTime createdAt,
    UserSummaryResponse user,
    SpaceSummaryResponse space) {}
