package com.project.relentless.feature.space.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AddressRequest(
    @NotBlank String street,
    @NotBlank String streetNumber,
    String apartmentNumber,
    @NotBlank String postalCode,
    @NotBlank String city,
    @NotBlank String country) {}
