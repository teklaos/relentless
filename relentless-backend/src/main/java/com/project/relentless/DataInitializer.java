package com.project.relentless;

import com.project.relentless.features.bookings.*;
import com.project.relentless.features.spaces.*;
import com.project.relentless.features.users.User;
import com.project.relentless.features.users.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
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

    var amenity1 = Amenity.builder().name("Wi-Fi").build();

    var amenity2 = Amenity.builder().name("Air Conditioning").build();

    var amenity3 = Amenity.builder().name("Parking").build();

    amenityRepository.saveAll(List.of(amenity1, amenity2, amenity3));

    var category1 =
        Category.builder()
            .name("Dancing Studio")
            .description("An assembly hall with a large mirror")
            .build();

    var category2 = Category.builder().name("Vocal Studio").build();

    categoryRepository.saveAll(List.of(category1, category2));

    var space1 =
        Space.builder()
            .name("MOVE DANCE STUDIO")
            .description("A spacious dance studio with a large mirror and wooden floors.")
            .address(
                Address.builder()
                    .street("Main St.")
                    .streetNumber("67")
                    .unitNumber("A")
                    .city("Warsaw")
                    .postalCode("00-120")
                    .country("Poland")
                    .build())
            .pricePerHour(new BigDecimal("50.00"))
            .publishedOn(LocalDate.of(2025, 12, 1))
            .build();

    var space2 =
        Space.builder()
            .name("SING VOCAL STUDIO")
            .description("A cozy vocal studio with soundproof walls and a piano.")
            .address(
                Address.builder()
                    .street("Second St.")
                    .streetNumber("45")
                    .unitNumber("B")
                    .city("Warsaw")
                    .postalCode("00-130")
                    .country("Poland")
                    .build())
            .pricePerHour(new BigDecimal("70.00"))
            .publishedOn(LocalDate.of(2025, 11, 15))
            .build();

    space1.setHost(host);
    space2.setHost(host);

    spaceRepository.saveAll(List.of(space1, space2));

    space1.setCategory(category1);
    space2.setCategory(category2);

    space1.setAmenities(Set.of(amenity1, amenity2));
    space2.setAmenities(Set.of(amenity2, amenity3));

    spaceRepository.saveAll(List.of(space1, space2));

    user.setSavedSpaces(Set.of(space1));

    userRepository.saveAll(List.of(user, host));

    var startTime = LocalDateTime.of(2026, 3, 7, 12, 30);
    var endTime = LocalDateTime.of(2026, 3, 7, 14, 0);

    var minutes = Duration.between(startTime, endTime).toMinutes();

    var durationHours =
        BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

    var totalPrice =
        space1.getPricePerHour().multiply(durationHours).setScale(2, RoundingMode.HALF_UP);

    var booking =
        Booking.builder()
            .user(user)
            .space(space1)
            .startTime(startTime)
            .endTime(endTime)
            .totalPrice(totalPrice)
            .status(BookingStatus.COMPLETED)
            .build();

    bookingRepository.save(booking);

    var review =
        Review.builder()
            .rating(5)
            .comment("Great place!")
            .createdAt(LocalDateTime.of(2026, 3, 7, 19, 0))
            .build();

    review.setBooking(booking);

    reviewRepository.save(review);

    log.info("Database initialized.");
  }
}
