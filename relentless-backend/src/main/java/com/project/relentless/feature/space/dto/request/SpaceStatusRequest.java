package com.project.relentless.feature.space.dto.request;

import com.project.relentless.feature.space.SpaceStatus;
import jakarta.validation.constraints.NotNull;

public record SpaceStatusRequest(@NotNull SpaceStatus status) {}
