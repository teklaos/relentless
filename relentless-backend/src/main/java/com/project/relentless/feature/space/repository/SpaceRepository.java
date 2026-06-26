package com.project.relentless.feature.space.repository;

import com.project.relentless.feature.space.entity.Space;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SpaceRepository extends JpaRepository<Space, Long> {
  @Query("SELECT s FROM Space s JOIN s.savedBy u WHERE u.id = :userId AND s.isDeleted = false")
  List<Space> findSavedByUserId(@Param("userId") Long userId);
}
