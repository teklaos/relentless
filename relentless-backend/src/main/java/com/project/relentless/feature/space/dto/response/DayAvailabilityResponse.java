package com.project.relentless.feature.space.dto.response;

import java.time.LocalDate;

public record DayAvailabilityResponse(LocalDate date, boolean isAvailable) {}
