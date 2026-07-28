package com.project.relentless.feature.auth;

import com.project.relentless.feature.auth.details.CustomUserDetails;
import com.project.relentless.feature.auth.dto.request.LoginRequest;
import com.project.relentless.feature.auth.dto.request.RefreshTokenRequest;
import com.project.relentless.feature.auth.dto.request.RegisterHostRequest;
import com.project.relentless.feature.auth.dto.request.RegisterUserRequest;
import com.project.relentless.feature.auth.dto.response.AccessTokenResponse;
import com.project.relentless.feature.auth.dto.response.AuthResponse;
import com.project.relentless.feature.auth.jwt.JwtService;
import com.project.relentless.feature.auth.refresh.RefreshTokenService;
import com.project.relentless.feature.user.Role;
import com.project.relentless.feature.user.UserMapper;
import com.project.relentless.feature.user.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.persistence.EntityExistsException;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

  private final UserRepository userRepository;
  private final UserMapper userMapper;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final RefreshTokenService refreshTokenService;
  private final AuthenticationManager authenticationManager;

  @Override
  @Transactional
  public AuthResponse register(RegisterUserRequest request) {
    if (userRepository.findByEmail(request.email()).isPresent()) {
      throw new EntityExistsException("Email is already in use");
    }
    if (Period.between(request.dateOfBirth(), LocalDate.now()).getYears() < 14) {
      throw new IllegalArgumentException("You must be at least 14 years old.");
    }

    var user = userMapper.toUser(request);
    user.setPasswordHash(passwordEncoder.encode(request.password()));

    var savedUser = userRepository.save(user);

    String accessToken = jwtService.generateAccessToken(savedUser.getId());
    String refreshToken = refreshTokenService.generateRefreshToken(savedUser.getId());

    return new AuthResponse(accessToken, refreshToken);
  }

  @Override
  @Transactional
  public AuthResponse registerHost(RegisterHostRequest request) {
    if (userRepository.findByEmail(request.email()).isPresent()) {
      throw new EntityExistsException("Email is already in use");
    }
    if (Period.between(request.dateOfBirth(), LocalDate.now()).getYears() < 18) {
      throw new IllegalArgumentException("You must be at least 18 years old to be a host.");
    }

    var user = userMapper.toUser(request);
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    user.setRole(Role.HOST);
    user.setDateAcceptedTerms(LocalDate.now());

    var savedUser = userRepository.save(user);

    String accessToken = jwtService.generateAccessToken(savedUser.getId());
    String refreshToken = refreshTokenService.generateRefreshToken(savedUser.getId());

    return new AuthResponse(accessToken, refreshToken);
  }

  @Override
  public AuthResponse login(LoginRequest request) {
    var auth =
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password()));

    if (!(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
      throw new IllegalStateException("Unexpected principal type");
    }

    String accessToken = jwtService.generateAccessToken(userDetails.getId());
    String refreshToken = refreshTokenService.generateRefreshToken(userDetails.getId());

    return new AuthResponse(accessToken, refreshToken);
  }

  @Override
  public AccessTokenResponse refreshAccessToken(RefreshTokenRequest request) {
    var refreshToken = refreshTokenService.findByRawToken(request.refreshToken());

    if (refreshToken.getExpiration().isBefore(Instant.now())) {
      refreshTokenService.deleteByRawToken(request.refreshToken());
      throw new JwtException("Refresh token expired");
    }

    Long userId = refreshToken.getUser().getId();
    String accessToken = jwtService.generateAccessToken(userId);

    return new AccessTokenResponse(accessToken);
  }

  @Override
  public void logout(RefreshTokenRequest request) {
    refreshTokenService.deleteByRawToken(request.refreshToken());
  }

  @Override
  public void logoutEverywhere(RefreshTokenRequest request) {
    var refreshToken = refreshTokenService.findByRawToken(request.refreshToken());
    Long userId = refreshToken.getUser().getId();

    refreshTokenService.deleteAllByUserId(userId);
  }

  @Override
  public Long getCurrentUserId() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
      throw new AuthenticationCredentialsNotFoundException("Unauthorized");
    }
    if (!(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
      throw new AuthenticationCredentialsNotFoundException("Unauthorized");
    }
    return userDetails.getId();
  }
}
