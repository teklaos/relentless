package com.project.relentless.feature.auth.refresh;

public interface RefreshTokenService {
  String generateRefreshToken(Long id);

  RefreshToken findByRawToken(String rawToken);

  void deleteByRawToken(String rawToken);

  void deleteAllByUserId(Long userId);
}
