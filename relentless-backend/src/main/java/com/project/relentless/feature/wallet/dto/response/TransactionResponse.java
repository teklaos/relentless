package com.project.relentless.feature.wallet.dto.response;

import com.project.relentless.feature.space.dto.response.SpaceSummaryResponse;
import java.math.BigDecimal;
import java.time.Instant;

public record TransactionResponse(
    Long id, BigDecimal amount, String type, Instant createdAt, SpaceSummaryResponse space) {}
