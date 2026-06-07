package com.project.relentless.feature.space.service;

import com.project.relentless.feature.space.dto.response.AmenityResponse;
import com.project.relentless.feature.space.mapper.AmenityMapper;
import com.project.relentless.feature.space.repository.AmenityRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AmenityServiceImpl implements AmenityService {

  private final AmenityRepository amenityRepository;
  private final AmenityMapper amenityMapper;

  @Override
  public List<AmenityResponse> getAll() {
    return amenityRepository.findAll().stream().map(amenityMapper::toAmenityResponse).toList();
  }
}
