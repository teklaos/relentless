package com.project.relentless.feature.payment;

import com.project.relentless.feature.booking.entity.Booking;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeServiceImpl implements StripeService {

  @Value("${stripe.webhook.secret}")
  private String stripeWebhookSecret;

  @Value("${app.frontend-url}")
  private String frontendUrl;

  @Override
  public Session createCheckoutSession(Booking booking) {
    try {
      var params =
          SessionCreateParams.builder()
              .setMode(SessionCreateParams.Mode.PAYMENT)
              .setSuccessUrl(frontendUrl + "/payments/success")
              .setCancelUrl(frontendUrl + "/payments/cancel")
              .putMetadata("bookingId", booking.getId().toString())
              .setExpiresAt(Instant.now().plus(Duration.ofMinutes(30)).getEpochSecond())
              .addLineItem(
                  SessionCreateParams.LineItem.builder()
                      .setQuantity(1L)
                      .setPriceData(
                          SessionCreateParams.LineItem.PriceData.builder()
                              .setCurrency("eur")
                              .setUnitAmount(
                                  booking
                                      .getTotalPrice()
                                      .multiply(BigDecimal.valueOf(100))
                                      .setScale(0, RoundingMode.HALF_UP)
                                      .longValueExact())
                              .setProductData(
                                  SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                      .setName(booking.getSpace().getName())
                                      .build())
                              .build())
                      .build())
              .build();

      return Session.create(params);
    } catch (StripeException ex) {
      throw new PaymentGatewayException("Failed to create Stripe checkout session", ex);
    }
  }

  @Override
  public Event constructWebhookEvent(String payload, String signatureHeader) {
    try {
      return Webhook.constructEvent(payload, signatureHeader, stripeWebhookSecret);
    } catch (SignatureVerificationException ex) {
      throw new IllegalArgumentException("Invalid Stripe webhook signature", ex);
    }
  }
}
