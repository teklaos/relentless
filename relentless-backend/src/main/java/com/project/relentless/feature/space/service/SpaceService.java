package com.project.relentless.feature.space.service;

import com.project.relentless.feature.space.dto.request.CreateSpaceRequest;
import com.project.relentless.feature.space.dto.request.EditSpaceRequest;
import com.project.relentless.feature.space.dto.request.SpaceStatusRequest;
import com.project.relentless.feature.space.dto.response.DayAvailabilityResponse;
import com.project.relentless.feature.space.dto.response.SpaceResponse;
import com.project.relentless.feature.space.dto.response.TimeSlotResponse;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

public interface SpaceService {
  List<SpaceResponse> getAll();

  List<SpaceResponse> getSavedByCurrentUser();

  List<SpaceResponse> getHostedByCurrentUser();

  SpaceResponse getById(Long id);

  List<TimeSlotResponse> getAvailabilityById(Long id, LocalDate date);

  List<DayAvailabilityResponse> getMonthAvailabilityById(Long id, YearMonth month);

  void save(Long id);

  void unsave(Long id);

  SpaceResponse create(CreateSpaceRequest request);

  SpaceResponse edit(Long id, EditSpaceRequest request);

  SpaceResponse changeStatus(Long id, SpaceStatusRequest request);

  void delete(Long id);

  void deleteHostedByCurrentUser();
}
