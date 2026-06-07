package com.project.relentless.feature.space.service;

import com.project.relentless.feature.space.dto.response.AmenityResponse;
import java.util.List;

public interface AmenityService {
  List<AmenityResponse> getAll();
}
