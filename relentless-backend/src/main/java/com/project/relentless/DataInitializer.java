package com.project.relentless;

import com.project.relentless.features.bookings.BookingRepository;
import com.project.relentless.features.bookings.ReviewRepository;
import com.project.relentless.features.spaces.AmenityRepository;
import com.project.relentless.features.spaces.CategoryRepository;
import com.project.relentless.features.spaces.SpaceRepository;
import com.project.relentless.features.users.User;
import com.project.relentless.features.users.UserRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer {

  private final BookingRepository bookingRepository;
  private final ReviewRepository reviewRepository;
  private final AmenityRepository amenityRepository;
  private final CategoryRepository categoryRepository;
  private final SpaceRepository spaceRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  @EventListener(ContextRefreshedEvent.class)
  public void init() {
    if (bookingRepository.count() > 0
        || reviewRepository.count() > 0
        || amenityRepository.count() > 0
        || categoryRepository.count() > 0
        || spaceRepository.count() > 0
        || userRepository.count() > 0) {
      log.info("Database already initialized.");
      return;
    }

    var user =
        User.builder()
            .username("user")
            .passwordHash(passwordEncoder.encode("P@ssw0rd"))
            .email("user@gmail.com")
            .dateOfBirth(LocalDate.of(2005, 1, 12))
            .isDeleted(false)
            .build();

    var host =
        User.builder()
            .username("host")
            .passwordHash(passwordEncoder.encode("P@ssw0rd"))
            .email("host@gmail.com")
            .dateOfBirth(LocalDate.of(2004, 11, 20))
            .isDeleted(false)
            .build();

    userRepository.saveAll(List.of(user, host));
  }
}
