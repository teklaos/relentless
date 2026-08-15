package com.project.relentless.feature.space.dto.response;

import java.time.LocalTime;

public record TimeSlotResponse(LocalTime startTime, LocalTime endTime, boolean isAvailable) {}
