package com.project.relentless.feature.space.service;

import com.project.relentless.feature.space.dto.response.SpaceResponse;
import com.project.relentless.feature.space.mapper.SpaceMapper;
import com.project.relentless.feature.space.repository.SpaceRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SpaceServiceImpl implements SpaceService {

  private final SpaceRepository spaceRepository;
  private final SpaceMapper spaceMapper;

  @Override
  public List<SpaceResponse> getAll() {
    return spaceRepository.findAll().stream().map(spaceMapper::toSpaceResponse).toList();
  }

  @Override
  public SpaceResponse getById(Long id) {
    var space =
        spaceRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Space not found"));

    return spaceMapper.toSpaceResponse(space);
  }
}
