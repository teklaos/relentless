package com.project.relentless.feature.space.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.LocalTime;

public record WorkingHoursRequest(
    @NotNull DayOfWeek dayOfWeek, @NotNull LocalTime openTime, @NotNull LocalTime closeTime) {}
