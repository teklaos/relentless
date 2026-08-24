package com.project.relentless.feature.wallet;

import com.project.relentless.feature.wallet.dto.request.DebitWalletRequest;
import com.project.relentless.feature.wallet.dto.response.AdminTransactionResponse;
import com.project.relentless.feature.wallet.dto.response.BalanceResponse;
import com.project.relentless.feature.wallet.dto.response.TransactionResponse;
import java.math.BigDecimal;
import java.util.List;

public interface WalletService {
  BigDecimal HOST_KEEP_RATE = new BigDecimal("0.95");

  List<AdminTransactionResponse> getAllTransactions();

  BalanceResponse getBalanceByCurrentUser();

  List<TransactionResponse> getTransactionsByCurrentUser();

  void credit(Long bookingId);

  void debit(DebitWalletRequest request);
}
