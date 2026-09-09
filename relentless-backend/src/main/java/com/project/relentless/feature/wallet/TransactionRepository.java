package com.project.relentless.feature.wallet;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
  List<Transaction> findAllByOrderByCreatedAtDesc();

  List<Transaction> findAllByHostIdOrderByCreatedAtDesc(Long userId);

  boolean existsByBookingId(Long bookingId);

  @Query(
      """
      SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t
      WHERE t.host.id = :userId AND t.type = :type
      """)
  BigDecimal sumByHostIdAndType(@Param("userId") Long userId, @Param("type") TransactionType type);
}
