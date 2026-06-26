package com.project.relentless.feature.booking.dto.response;

import com.project.relentless.feature.space.dto.response.SpaceSummaryResponse;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BookingResponse(
    Long id,
    LocalDateTime startTime,
    LocalDateTime endTime,
    BigDecimal totalPrice,
    String status,
    boolean reviewed,
    SpaceSummaryResponse space) {}
