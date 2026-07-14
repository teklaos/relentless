package com.project.relentless.feature.space.repository;

import com.project.relentless.feature.space.SpaceStatus;
import com.project.relentless.feature.space.entity.Space;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpaceRepository extends JpaRepository<Space, Long> {
  List<Space> findAllByStatus(SpaceStatus status);

  List<Space> findBySavedByIdAndStatus(Long userId, SpaceStatus status);

  List<Space> findByHostIdAndStatusNot(Long userId, SpaceStatus status);
}
