package com.project.relentless.feature.auth.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class JwtServiceImpl implements JwtService {

  @Value("${jwt.access.secret}")
  private String secret;

  private static final long accessTokenExpiration = 60 * 60 * 1000L;

  private Key key;

  @PostConstruct
  public void init() {
    key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
  }

  @Override
  public String generateAccessToken(Long id) {
    var now = new Date();
    var exp = new Date(now.getTime() + accessTokenExpiration);

    return Jwts.builder()
        .setSubject(id.toString())
        .setIssuedAt(now)
        .setIssuer("relentless-backend")
        .setExpiration(exp)
        .signWith(key)
        .compact();
  }

  @Override
  public Long extractId(String token) {
    return Long.parseLong(extractClaim(token, Claims::getSubject));
  }

  private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
    var claims = extractAllClaims(token);
    return claimsResolver.apply(claims);
  }

  private Claims extractAllClaims(String token) {
    return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
  }

  @Override
  public boolean isValid(String token) {
    extractAllClaims(token);
    return true;
  }
}
