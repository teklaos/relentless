package com.project.relentless.features.auth.jwts;

public interface JwtService {

  String generateAccessToken(Long id);

  Long extractId(String token);

  boolean isValid(String token);
}
