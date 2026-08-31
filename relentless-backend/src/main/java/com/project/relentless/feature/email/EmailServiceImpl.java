package com.project.relentless.feature.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

  private final JavaMailSender javaMailSender;

  private static final String FROM_EMAIL = "noreply@relentless.com";
  private static final String FROM_NAME = "Relentless";

  private static final DateTimeFormatter DATE_FORMATTER =
      DateTimeFormatter.ofPattern("MMM dd yyyy", Locale.ENGLISH);
  private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

  @Async
  @Override
  public void sendOtp(String email, String otp) {
    sendEmail(
        email,
        "Verify your email",
        """
        Your Relentless verification code is %s.

        The code expires in 10 minutes. If you did not request it, you can ignore this email.

        Welcome aboard,
        The Relentless team
        """
            .formatted(otp));
  }

  @Async
  @Override
  public void sendBookingConfirmation(
      String email,
      String username,
      String spaceName,
      LocalDateTime start,
      LocalDateTime end,
      BigDecimal total,
      Long bookingId) {
    sendEmail(
        email,
        "Booking confirmed - " + spaceName,
        """
        Hi %s,

        Your payment went through and your booking is confirmed.

        Space: %s
        Date & Time: %s, %s - %s
        Total: € %s

        Booking reference: #%d

        You can view or cancel this booking any time in the Relentless app.

        See you soon,
        The Relentless team
        """
            .formatted(
                username,
                spaceName,
                start.format(DATE_FORMATTER),
                start.format(TIME_FORMATTER),
                end.format(TIME_FORMATTER),
                total.setScale(2, RoundingMode.HALF_UP),
                bookingId));
  }

  private void sendEmail(String to, String subject, String text) {
    try {
      MimeMessage mimeMessage = javaMailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

      helper.setFrom(FROM_EMAIL, FROM_NAME);
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setReplyTo(FROM_EMAIL);
      helper.setText(text, false);

      javaMailSender.send(mimeMessage);
      log.info("Email sent successfully to: {}", to);
    } catch (MessagingException | UnsupportedEncodingException | MailException ex) {
      log.error("Error sending email to {}: {}", to, ex.getMessage(), ex);
    }
  }
}
