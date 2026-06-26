package com.project.relentless.feature.booking.repository;

import com.project.relentless.feature.booking.BookingStatus;
import com.project.relentless.feature.booking.entity.Booking;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
  List<Booking> findAllByUserId(Long userId);

  @Query(
      """
    SELECT COUNT(b) > 0 FROM Booking b
    WHERE b.space.id = :spaceId
        AND b.status <> :excludedStatus
        AND b.startTime < :endTime AND b.endTime > :startTime
    """)
  boolean existsOverlapping(
      @Param("spaceId") Long spaceId,
      @Param("excludedStatus") BookingStatus excluded,
      @Param("startTime") LocalDateTime start,
      @Param("endTime") LocalDateTime end);
}
