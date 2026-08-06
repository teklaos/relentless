package com.project.relentless.feature.wallet;

import com.project.relentless.feature.space.mapper.SpaceMapper;
import com.project.relentless.feature.wallet.dto.response.AdminTransactionResponse;
import com.project.relentless.feature.wallet.dto.response.TransactionResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = SpaceMapper.class)
public interface TransactionMapper {

  @Mapping(target = "space", source = "booking.space")
  TransactionResponse toTransactionResponse(Transaction transaction);

  @Mapping(target = "totalPrice", source = "booking.totalPrice")
  @Mapping(target = "user", source = "booking.user")
  AdminTransactionResponse toAdminTransactionResponse(Transaction transaction);
}
