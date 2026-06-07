package com.project.relentless.feature.space.dto.response;

import com.project.relentless.feature.user.dto.response.UserSummaryResponse;
import java.math.BigDecimal;
import java.util.List;

public record SpaceResponse(
    Long id,
    String name,
    String description,
    BigDecimal pricePerHour,
    AddressResponse address,
    CategorySummaryResponse category,
    UserSummaryResponse host,
    List<AmenityResponse> amenities,
    double rating,
    int reviewCount) {}
