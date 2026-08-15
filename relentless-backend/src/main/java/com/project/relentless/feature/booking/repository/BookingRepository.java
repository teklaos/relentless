package com.project.relentless.feature.booking.repository;

import com.project.relentless.feature.booking.BookingStatus;
import com.project.relentless.feature.booking.entity.Booking;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
  List<Booking> findAllByUserId(Long userId);

  List<Booking> findAllBySpaceHostId(Long userId);

  List<Booking> findAllByStatusAndCreatedAtBefore(BookingStatus status, LocalDateTime timestamp);

  List<Booking> findAllByStatusAndEndTimeBefore(BookingStatus status, LocalDateTime timestamp);

  List<Booking> findAllBySpaceIdAndStatusNotAndStartTimeBeforeAndEndTimeAfter(
      Long spaceId, BookingStatus status, LocalDateTime endTime, LocalDateTime startTime);

  boolean existsBySpaceIdAndStatusNotAndStartTimeBeforeAndEndTimeAfter(
      Long spaceId, BookingStatus status, LocalDateTime endTime, LocalDateTime startTime);
}
