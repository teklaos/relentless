package com.project.relentless.feature.space.dto.response;

public record AddressResponse(
    String street,
    String streetNumber,
    String apartmentNumber,
    String postalCode,
    String city,
    String country) {}
