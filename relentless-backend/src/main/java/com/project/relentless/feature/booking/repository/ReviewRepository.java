package com.project.relentless.feature.booking.repository;

import com.project.relentless.feature.booking.entity.Review;
import com.project.relentless.feature.space.dto.projection.SpaceRatingProjection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

  @Query(
      """
      SELECT b.space.id AS spaceId, AVG(r.rating) AS rating, COUNT(r.id) AS reviewCount
      FROM Review r
      JOIN r.booking b
      GROUP BY b.space.id
      """)
  List<SpaceRatingProjection> findRatingStats();

  @Query(
      """
      SELECT b.space.id AS spaceId, AVG(r.rating) AS rating, COUNT(r.id) AS reviewCount
      FROM Review r
      JOIN r.booking b
      WHERE b.space.id = :spaceId
      GROUP BY b.space.id
      """)
  List<SpaceRatingProjection> findRatingStatsBySpaceId(@Param("spaceId") Long spaceId);

  @Query(
      """
      SELECT r FROM Review r
      JOIN FETCH r.booking b
      JOIN FETCH b.user
      WHERE b.space.id = :spaceId
      """)
  List<Review> findBySpaceIdWithAuthor(@Param("spaceId") Long spaceId);
}
