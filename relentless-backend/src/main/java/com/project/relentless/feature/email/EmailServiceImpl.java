package com.project.relentless.feature.email;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

  private final JavaMailSender javaMailSender;

  private static final String fromEmail = "noreply@relentless.com";
  private static final String fromName = "Relentless";

  @Async
  @SneakyThrows
  public void sendEmail(String to, String subject, String text) {
    try {
      MimeMessage mimeMessage = javaMailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

      helper.setFrom(fromEmail, fromName);
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setReplyTo(fromEmail);
      helper.setText(text, false);

      javaMailSender.send(mimeMessage);
      log.info("Email sent successfully to: {}", to);
    } catch (Exception ex) {
      log.error("Error sending email to {}: {}", to, ex.getMessage(), ex);
    }
  }
}
