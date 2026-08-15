package com.project.relentless.feature.auth.refresh;

import com.project.relentless.feature.user.UserRepository;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.Key;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import javax.crypto.Mac;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

  private final RefreshTokenRepository refreshTokenRepository;
  private final UserRepository userRepository;

  @Value("${jwt.refresh.secret}")
  private String secret;

  private static final long REFRESH_TOKEN_EXPIRATION = 30 * 24 * 60 * 60 * 1000L;
  private static final SecureRandom SECURE_RANDOM = new SecureRandom();
  private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();

  private Key key;

  @PostConstruct
  public void init() {
    key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
  }

  @Override
  @Transactional
  public String generateRefreshToken(Long userId) {
    var user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

    String token = generateToken();
    String tokenHash = hmacSha256Hex(token);

    var exp = Instant.now().plusMillis(REFRESH_TOKEN_EXPIRATION);

    var refreshToken =
        RefreshToken.builder().user(user).tokenHash(tokenHash).expiration(exp).build();

    refreshTokenRepository.save(refreshToken);
    return token;
  }

  @Override
  public RefreshToken findByRawToken(String rawToken) {
    String tokenHash = hmacSha256Hex(rawToken);
    return refreshTokenRepository
        .findByTokenHash(tokenHash)
        .orElseThrow(
            () -> new AuthenticationCredentialsNotFoundException("Refresh token not found"));
  }

  @Override
  @Transactional
  public void deleteByRawToken(String rawToken) {
    String tokenHash = hmacSha256Hex(rawToken);
    refreshTokenRepository.deleteByTokenHash(tokenHash);
  }

  @Override
  @Transactional
  public void deleteAllByUserId(Long userId) {
    refreshTokenRepository.deleteAllByUserId(userId);
  }

  private String generateToken() {
    byte[] randomBytes = new byte[64];
    SECURE_RANDOM.nextBytes(randomBytes);
    return ENCODER.encodeToString(randomBytes);
  }

  private String hmacSha256Hex(String rawToken) {
    try {
      var mac = Mac.getInstance("HmacSHA256");
      mac.init(key);
      byte[] rawHmac = mac.doFinal(rawToken.getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(rawHmac);

    } catch (NoSuchAlgorithmException | InvalidKeyException ex) {
      log.error("{}: {}", ex.getClass().getName(), ex.getMessage());
      throw new RuntimeException("Could not generate HMAC-SHA256", ex);
    }
  }
}
