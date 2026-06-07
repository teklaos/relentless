package com.project.relentless.feature.user;

import com.project.relentless.feature.auth.dto.request.RegisterUserRequest;
import com.project.relentless.feature.user.dto.response.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
  UserResponse toUserResponse(User user);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "passwordHash", ignore = true)
  @Mapping(target = "dateJoined", ignore = true)
  @Mapping(target = "role", ignore = true)
  @Mapping(target = "isDeleted", ignore = true)
  User toUser(RegisterUserRequest request);
}
