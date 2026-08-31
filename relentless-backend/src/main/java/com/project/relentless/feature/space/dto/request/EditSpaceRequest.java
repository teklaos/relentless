package com.project.relentless.feature.space.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

public record EditSpaceRequest(
    @Size(max = 50) String name,
    @Size(max = 255) String description,
    @Valid AddressRequest address,
    @DecimalMin(value = "1.00") @Digits(integer = 10, fraction = 2) BigDecimal pricePerHour,
    @Size(min = 1) @Valid List<WorkingHoursRequest> workingHours,
    List<String> imageKeys,
    Long categoryId,
    Set<Long> amenityIds) {}
