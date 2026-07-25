package com.project.relentless.feature.wallet;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
  List<Transaction> findAllByHostIdOrderByCreatedAtDesc(Long userId);

  boolean existsByBookingId(Long bookingId);
}
