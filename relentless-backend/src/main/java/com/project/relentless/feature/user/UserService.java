package com.project.relentless.feature.user;

import com.project.relentless.feature.user.dto.response.UserResponse;

public interface UserService {
  UserResponse getById(Long id);
}
