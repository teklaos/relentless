package com.project.relentless.feature.auth.jwt;

public interface JwtService {

  String generateAccessToken(Long id);

  Long extractId(String token);

  boolean isValid(String token);
}
