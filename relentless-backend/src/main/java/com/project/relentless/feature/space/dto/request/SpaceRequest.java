package com.project.relentless.feature.space.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

public record SpaceRequest(
    @NotBlank @Size(max = 50) String name,
    @Size(max = 255) String description,
    @NotNull @DecimalMin(value = "0.00") @Digits(integer = 10, fraction = 2)
        BigDecimal pricePerHour,
    @NotNull @Valid AddressRequest address,
    @NotNull Long categoryId,
    Set<Long> amenityIds,
    List<String> imageKeys) {}
