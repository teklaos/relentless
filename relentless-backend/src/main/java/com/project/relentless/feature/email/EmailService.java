package com.project.relentless.feature.email;

public interface EmailService {
  void sendEmail(String to, String subject, String text);
}
