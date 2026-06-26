package com.project.relentless.feature.booking.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record CreateBookingRequest(
    @NotNull Long spaceId,
    @NotNull @Future LocalDateTime startTime,
    @NotNull @Future LocalDateTime endTime) {}
