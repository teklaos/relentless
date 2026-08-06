package com.project.relentless.feature.user;

import com.project.relentless.feature.user.dto.request.ChangePasswordRequest;
import com.project.relentless.feature.user.dto.request.EditUserRequest;
import com.project.relentless.feature.user.dto.response.AdminUserResponse;
import com.project.relentless.feature.user.dto.response.UserResponse;
import java.util.List;

public interface UserService {
  List<AdminUserResponse> getAll();

  List<AdminUserResponse> getAllActive();

  UserResponse getCurrent();

  AdminUserResponse getById(Long id);

  UserResponse editCurrent(EditUserRequest request);

  void changeCurrentPassword(ChangePasswordRequest request);

  void deleteCurrent();
}
