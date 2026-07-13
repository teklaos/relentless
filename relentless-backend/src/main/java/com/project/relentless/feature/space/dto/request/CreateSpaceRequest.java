package com.project.relentless.feature.space.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

public record CreateSpaceRequest(
    @NotBlank @Size(max = 50) String name,
    @Size(max = 255) String description,
    @NotNull @Valid AddressRequest address,
    @NotNull @DecimalMin(value = "0.00") @Digits(integer = 10, fraction = 2)
        BigDecimal pricePerHour,
    @NotNull @Valid List<WorkingHoursRequest> workingHours,
    List<String> imageKeys,
    @NotNull Long categoryId,
    Set<Long> amenityIds) {}
