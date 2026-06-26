package com.project.relentless.feature.booking.dto.request;

import jakarta.validation.constraints.*;

public record LeaveReviewRequest(
    @NotNull Long bookingId, @Min(1) @Max(5) int rating, @NotBlank String comment) {}
