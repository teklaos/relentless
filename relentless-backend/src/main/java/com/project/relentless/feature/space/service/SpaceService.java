package com.project.relentless.feature.space.service;

import com.project.relentless.feature.space.dto.response.SpaceResponse;
import java.util.List;

public interface SpaceService {
  List<SpaceResponse> getAll();

  SpaceResponse getById(Long id);
}
