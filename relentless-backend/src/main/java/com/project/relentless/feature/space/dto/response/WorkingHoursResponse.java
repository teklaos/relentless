package com.project.relentless.feature.space.dto.response;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record WorkingHoursResponse(DayOfWeek dayOfWeek, LocalTime openTime, LocalTime closeTime) {}
