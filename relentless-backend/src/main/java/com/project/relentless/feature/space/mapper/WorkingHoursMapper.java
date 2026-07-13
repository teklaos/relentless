package com.project.relentless.feature.space.mapper;

import com.project.relentless.feature.space.dto.request.WorkingHoursRequest;
import com.project.relentless.feature.space.entity.WorkingHours;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface WorkingHoursMapper {
  List<WorkingHours> toWorkingHours(List<WorkingHoursRequest> workingHoursRequests);
}
