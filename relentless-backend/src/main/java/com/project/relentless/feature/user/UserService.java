package com.project.relentless.feature.user;

import com.project.relentless.feature.user.dto.request.ChangePasswordRequest;
import com.project.relentless.feature.user.dto.request.EditUserRequest;
import com.project.relentless.feature.user.dto.response.UserResponse;

public interface UserService {
  UserResponse getCurrent();

  UserResponse getById(Long id);

  UserResponse editCurrent(EditUserRequest request);

  void changeCurrentPassword(ChangePasswordRequest request);

  void deleteCurrent();
}
