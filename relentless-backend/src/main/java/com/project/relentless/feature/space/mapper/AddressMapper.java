package com.project.relentless.feature.space.mapper;

import com.project.relentless.feature.space.dto.request.AddressRequest;
import com.project.relentless.feature.space.entity.Address;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AddressMapper {
  Address toAddress(AddressRequest addressRequest);
}
