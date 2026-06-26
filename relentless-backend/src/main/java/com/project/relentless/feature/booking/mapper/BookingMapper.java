package com.project.relentless.feature.booking.mapper;

import com.project.relentless.feature.booking.dto.response.BookingResponse;
import com.project.relentless.feature.booking.entity.Booking;
import com.project.relentless.feature.space.mapper.SpaceMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
    componentModel = "spring",
    uses = {SpaceMapper.class})
public interface BookingMapper {

  @Mapping(target = "status", expression = "java(booking.getStatus().name())")
  @Mapping(target = "reviewed", expression = "java(booking.getReview() != null)")
  BookingResponse toBookingResponse(Booking booking);
}
