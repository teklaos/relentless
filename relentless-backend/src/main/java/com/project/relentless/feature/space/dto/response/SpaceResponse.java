package com.project.relentless.feature.space.dto.response;

import com.project.relentless.feature.user.dto.response.UserSummaryResponse;
import java.math.BigDecimal;
import java.util.List;

public record SpaceResponse(
    Long id,
    String name,
    String description,
    AddressResponse address,
    BigDecimal pricePerHour,
    List<WorkingHoursResponse> workingHours,
    String status,
    double rating,
    int reviewCount,
    List<String> imageKeys,
    CategorySummaryResponse category,
    UserSummaryResponse host,
    List<AmenityResponse> amenities) {}
