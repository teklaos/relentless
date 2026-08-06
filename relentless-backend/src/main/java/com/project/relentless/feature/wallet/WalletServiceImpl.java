package com.project.relentless.feature.wallet;

import com.project.relentless.feature.auth.AuthService;
import com.project.relentless.feature.booking.repository.BookingRepository;
import com.project.relentless.feature.user.UserRepository;
import com.project.relentless.feature.wallet.dto.request.DebitWalletRequest;
import com.project.relentless.feature.wallet.dto.response.AdminTransactionResponse;
import com.project.relentless.feature.wallet.dto.response.BalanceResponse;
import com.project.relentless.feature.wallet.dto.response.TransactionResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

  private final TransactionRepository transactionRepository;
  private final TransactionMapper transactionMapper;
  private final BookingRepository bookingRepository;
  private final UserRepository userRepository;
  private final AuthService authService;

  private static final BigDecimal HOST_KEEP_RATE = new BigDecimal("0.95");

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public List<AdminTransactionResponse> getAllTransactions() {
    return transactionRepository.findAllByOrderByCreatedAtDesc().stream()
        .map(transactionMapper::toAdminTransactionResponse)
        .toList();
  }

  @Override
  @PreAuthorize("hasRole('HOST')")
  public BalanceResponse getBalanceByCurrentUser() {
    Long userId = authService.getCurrentUserId();
    var balance = getBalanceByUserId(userId);

    return new BalanceResponse(balance);
  }

  @Override
  @PreAuthorize("hasRole('HOST')")
  public List<TransactionResponse> getTransactionsByCurrentUser() {
    Long userId = authService.getCurrentUserId();
    return transactionRepository.findAllByHostIdOrderByCreatedAtDesc(userId).stream()
        .map(transactionMapper::toTransactionResponse)
        .toList();
  }

  @Override
  @Transactional
  public void credit(Long bookingId) {
    if (transactionRepository.existsByBookingId(bookingId)) {
      return;
    }

    var booking =
        bookingRepository
            .findById(bookingId)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found."));
    var amount = booking.getTotalPrice().multiply(HOST_KEEP_RATE).setScale(2, RoundingMode.HALF_UP);

    var transaction =
        Transaction.builder()
            .amount(amount)
            .type(TransactionType.CREDIT)
            .host(booking.getSpace().getHost())
            .booking(booking)
            .build();

    transactionRepository.save(transaction);
  }

  @Override
  @Transactional
  @PreAuthorize("hasRole('HOST')")
  public void debit(DebitWalletRequest request) {
    Long userId = authService.getCurrentUserId();
    var balance = getBalanceByUserId(userId);

    if (request.amount().compareTo(balance) > 0) {
      throw new IllegalArgumentException("Insufficient funds.");
    }

    var host =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found."));

    var transaction =
        Transaction.builder()
            .amount(request.amount())
            .type(TransactionType.DEBIT)
            .host(host)
            .build();

    transactionRepository.save(transaction);
  }

  private BigDecimal getBalanceByUserId(Long userId) {
    return transactionRepository.findAllByHostIdOrderByCreatedAtDesc(userId).stream()
        .map(t -> t.getType() == TransactionType.CREDIT ? t.getAmount() : t.getAmount().negate())
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }
}
