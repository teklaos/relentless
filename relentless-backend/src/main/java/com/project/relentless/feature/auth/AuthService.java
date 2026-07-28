package com.project.relentless.feature.auth;

import com.project.relentless.feature.auth.dto.request.LoginRequest;
import com.project.relentless.feature.auth.dto.request.RefreshTokenRequest;
import com.project.relentless.feature.auth.dto.request.RegisterHostRequest;
import com.project.relentless.feature.auth.dto.request.RegisterUserRequest;
import com.project.relentless.feature.auth.dto.response.AccessTokenResponse;
import com.project.relentless.feature.auth.dto.response.AuthResponse;

public interface AuthService {
  AuthResponse register(RegisterUserRequest request);

  AuthResponse registerHost(RegisterHostRequest request);

  AuthResponse login(LoginRequest request);

  AccessTokenResponse refreshAccessToken(RefreshTokenRequest request);

  void logout(RefreshTokenRequest request);

  void logoutEverywhere(RefreshTokenRequest request);

  Long getCurrentUserId();
}
