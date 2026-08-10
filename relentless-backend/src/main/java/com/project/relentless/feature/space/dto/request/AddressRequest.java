package com.project.relentless.feature.space.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddressRequest(
    @NotBlank @Size(min = 2, max = 100) String street,
    @NotBlank @Size(min = 1, max = 10) String streetNumber,
    @Size(min = 1, max = 10) String apartmentNumber,
    @NotBlank @Size(min = 5, max = 10) String postalCode,
    @NotBlank @Size(min = 2, max = 100) String city,
    @NotBlank @Size(min = 2, max = 100) String country) {}
