package com.project.relentless.feature.user;

import com.project.relentless.feature.user.dto.request.UpdateUserRequest;
import com.project.relentless.feature.user.dto.response.UserResponse;

public interface UserService {
  UserResponse getCurrent();

  UserResponse getById(Long id);

  UserResponse update(Long id, UpdateUserRequest request);
}
