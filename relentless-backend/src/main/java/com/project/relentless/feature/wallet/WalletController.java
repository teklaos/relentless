package com.project.relentless.feature.wallet;

import com.project.relentless.feature.wallet.dto.request.DebitWalletRequest;
import com.project.relentless.feature.wallet.dto.response.AdminTransactionResponse;
import com.project.relentless.feature.wallet.dto.response.BalanceResponse;
import com.project.relentless.feature.wallet.dto.response.TransactionResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

  private final WalletService walletService;

  @GetMapping("/transactions")
  public ResponseEntity<List<AdminTransactionResponse>> getAllTransactions() {
    return ResponseEntity.ok(walletService.getAllTransactions());
  }

  @GetMapping("/me")
  public ResponseEntity<BalanceResponse> getBalanceByCurrentUser() {
    return ResponseEntity.ok(walletService.getBalanceByCurrentUser());
  }

  @GetMapping("/me/transactions")
  public ResponseEntity<List<TransactionResponse>> getTransactionsByCurrentUser() {
    return ResponseEntity.ok(walletService.getTransactionsByCurrentUser());
  }

  @PostMapping("/me/debit")
  public ResponseEntity<Void> debit(@Valid @RequestBody DebitWalletRequest request) {
    walletService.debit(request);
    return ResponseEntity.ok().build();
  }
}
