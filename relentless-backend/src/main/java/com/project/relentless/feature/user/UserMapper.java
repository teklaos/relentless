package com.project.relentless.feature.user;

import com.project.relentless.feature.auth.dto.request.RegisterHostRequest;
import com.project.relentless.feature.auth.dto.request.RegisterUserRequest;
import com.project.relentless.feature.user.dto.response.UserResponse;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring")
public interface UserMapper {
  UserResponse toUserResponse(User user);

  @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
  User toUser(RegisterUserRequest request);

  @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
  User toUser(RegisterHostRequest request);
}
