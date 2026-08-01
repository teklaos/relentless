package com.project.relentless.feature.payment;

import com.project.relentless.feature.booking.BookingStatus;
import com.project.relentless.feature.booking.repository.BookingRepository;
import com.project.relentless.feature.wallet.WalletService;
import com.stripe.model.checkout.Session;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class StripeController {

  private final StripeService stripeService;
  private final BookingRepository bookingRepository;
  private final WalletService walletService;

  @PostMapping("/webhook")
  public ResponseEntity<String> handleStripeWebhook(
      @RequestBody String payload, @RequestHeader("Stripe-Signature") String signature) {
    var event = stripeService.constructWebhookEvent(payload, signature);

    if (event.getType().equals("checkout.session.completed")) {
      var session = (Session) event.getDataObjectDeserializer().getObject().orElseThrow();

      if (!session.getPaymentStatus().equals("paid")) {
        return ResponseEntity.ok().build();
      }

      Long bookingId = Long.valueOf(session.getMetadata().get("bookingId"));
      var booking =
          bookingRepository
              .findById(bookingId)
              .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

      if (booking.getStatus() == BookingStatus.PENDING) {
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);
        walletService.credit(bookingId);
      }
    }
    return ResponseEntity.ok().build();
  }
}
