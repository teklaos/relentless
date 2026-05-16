package com.project.relentless.feature.auth;

import com.project.relentless.feature.auth.dto.request.LoginRequest;
import com.project.relentless.feature.auth.dto.request.RefreshTokenRequest;
import com.project.relentless.feature.auth.dto.request.RegisterUserRequest;
import com.project.relentless.feature.auth.dto.response.AccessTokenResponse;
import com.project.relentless.feature.auth.dto.response.AuthResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@RequestBody @Valid RegisterUserRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
    return ResponseEntity.ok(authService.login(request));
  }

  @PostMapping("/refresh-token")
  public ResponseEntity<AccessTokenResponse> refreshToken(
      @RequestBody @Valid RefreshTokenRequest request) {
    return ResponseEntity.ok(authService.refreshAccessToken(request));
  }

  @PostMapping("/logout")
  public ResponseEntity<Void> logout(@RequestBody @Valid RefreshTokenRequest request) {
    authService.logout(request);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/logout-everywhere")
  public ResponseEntity<Void> logoutEverywhere(@RequestBody @Valid RefreshTokenRequest request) {
    authService.logoutEverywhere(request);
    return ResponseEntity.noContent().build();
  }
}
