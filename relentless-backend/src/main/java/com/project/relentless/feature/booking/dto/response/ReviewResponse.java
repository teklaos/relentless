package com.project.relentless.feature.booking.dto.response;

import com.project.relentless.feature.space.dto.response.SpaceSummaryResponse;
import com.project.relentless.feature.user.dto.response.UserSummaryResponse;
import java.time.Instant;

public record ReviewResponse(
    Long id,
    int rating,
    String comment,
    Instant createdAt,
    UserSummaryResponse user,
    SpaceSummaryResponse space) {}
