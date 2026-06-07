package com.project.relentless.feature.space.mapper;

import com.project.relentless.feature.space.dto.response.AmenityResponse;
import com.project.relentless.feature.space.entity.Amenity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AmenityMapper {
  AmenityResponse toAmenityResponse(Amenity amenity);
}
