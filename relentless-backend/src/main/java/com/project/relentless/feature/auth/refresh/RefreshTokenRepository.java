package com.project.relentless.feature.auth.refresh;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
  Optional<RefreshToken> findByTokenHash(String token);

  void deleteByTokenHash(String token);

  void deleteAllByUserId(Long userId);
}
