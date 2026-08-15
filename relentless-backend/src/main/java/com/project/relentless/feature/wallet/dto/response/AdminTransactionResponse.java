package com.project.relentless.feature.wallet.dto.response;

import com.project.relentless.feature.user.dto.response.UserSummaryResponse;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminTransactionResponse(
    Long id,
    BigDecimal amount,
    BigDecimal totalPrice,
    String type,
    LocalDateTime createdAt,
    UserSummaryResponse user,
    UserSummaryResponse host) {}
