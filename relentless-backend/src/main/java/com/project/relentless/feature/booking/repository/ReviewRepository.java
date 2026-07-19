package com.project.relentless.feature.booking.repository;

import com.project.relentless.feature.booking.entity.Review;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

  @Query(
      """
      SELECT r FROM Review r
      JOIN FETCH r.booking b
      JOIN FETCH b.user
      WHERE b.space.id = :spaceId
      """)
  List<Review> findBySpaceId(@Param("spaceId") Long spaceId);

  @Query(
      """
      SELECT r FROM Review r
      JOIN FETCH r.booking b
      JOIN FETCH b.user
      JOIN FETCH b.space s
      WHERE s.host.id = :userId
      ORDER BY r.createdAt DESC
      """)
  List<Review> findByHostId(@Param("userId") Long userId);
}
