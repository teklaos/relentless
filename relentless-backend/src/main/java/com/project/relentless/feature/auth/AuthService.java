package com.project.relentless.feature.auth;

import com.project.relentless.feature.auth.dto.request.*;
import com.project.relentless.feature.auth.dto.response.AccessTokenResponse;
import com.project.relentless.feature.auth.dto.response.AuthResponse;

public interface AuthService {
  void register(RegisterUserRequest request);

  void registerHost(RegisterHostRequest request);

  void resendOtp(ResendOtpRequest request);

  AuthResponse verifyOtp(VerifyOtpRequest request);

  AuthResponse login(LoginRequest request);

  AccessTokenResponse refreshAccessToken(RefreshTokenRequest request);

  void logout(RefreshTokenRequest request);

  void logoutEverywhere(RefreshTokenRequest request);

  Long getCurrentUserId();
}
