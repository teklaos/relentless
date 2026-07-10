package com.project.relentless.feature.space.service;

import com.project.relentless.feature.space.dto.request.SpaceRequest;
import com.project.relentless.feature.space.dto.request.SpaceStatusRequest;
import com.project.relentless.feature.space.dto.response.SpaceResponse;
import java.util.List;

public interface SpaceService {
  List<SpaceResponse> getAll();

  List<SpaceResponse> getSavedByCurrentUser();

  List<SpaceResponse> getHostedByCurrentUser();

  SpaceResponse getById(Long id);

  void save(Long id);

  void unsave(Long id);

  SpaceResponse create(SpaceRequest request);

  SpaceResponse edit(Long id, SpaceRequest request);

  SpaceResponse changeStatus(Long id, SpaceStatusRequest request);

  void delete(Long id);
}
