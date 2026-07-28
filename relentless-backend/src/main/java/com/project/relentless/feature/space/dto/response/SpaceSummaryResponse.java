package com.project.relentless.feature.space.dto.response;

public record SpaceSummaryResponse(
    Long id, String name, String coverImageKey, String city, String country, String categoryName) {}
