package com.project.relentless.feature.payment;

import com.project.relentless.feature.booking.entity.Booking;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;

public interface PaymentService {
  Session createCheckoutSession(Booking booking);

  Event constructWebhookEvent(String payload, String signHeader);
}
