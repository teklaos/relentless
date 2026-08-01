package com.project.relentless.feature.wallet;

import com.project.relentless.feature.wallet.dto.request.DebitWalletRequest;
import com.project.relentless.feature.wallet.dto.response.BalanceResponse;
import com.project.relentless.feature.wallet.dto.response.TransactionResponse;
import java.util.List;

public interface WalletService {
  BalanceResponse getBalanceByCurrentUser();

  List<TransactionResponse> getTransactionsByCurrentUser();

  void credit(Long bookingId);

  void debit(DebitWalletRequest request);
}
