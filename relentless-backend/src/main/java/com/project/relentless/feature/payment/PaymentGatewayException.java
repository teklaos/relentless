package com.project.relentless.feature.payment;

public class PaymentGatewayException extends RuntimeException {
  public PaymentGatewayException(String message, Throwable cause) {
    super(message, cause);
  }
}
