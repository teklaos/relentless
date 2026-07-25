package com.project.relentless.feature.wallet.dto.response;

import com.project.relentless.feature.space.dto.response.SpaceSummaryResponse;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse(
    Long id,
    BigDecimal amount,
    String type,
    LocalDateTime createdAt,
    Long bookingId,
    SpaceSummaryResponse space) {}
