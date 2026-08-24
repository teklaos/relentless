package com.project.relentless;

import com.project.relentless.feature.booking.*;
import com.project.relentless.feature.booking.entity.Booking;
import com.project.relentless.feature.booking.entity.Review;
import com.project.relentless.feature.booking.repository.BookingRepository;
import com.project.relentless.feature.booking.repository.ReviewRepository;
import com.project.relentless.feature.space.entity.Address;
import com.project.relentless.feature.space.entity.Amenity;
import com.project.relentless.feature.space.entity.Category;
import com.project.relentless.feature.space.entity.Space;
import com.project.relentless.feature.space.entity.WorkingHours;
import com.project.relentless.feature.space.repository.AmenityRepository;
import com.project.relentless.feature.space.repository.CategoryRepository;
import com.project.relentless.feature.space.repository.SpaceRepository;
import com.project.relentless.feature.user.Role;
import com.project.relentless.feature.user.User;
import com.project.relentless.feature.user.UserRepository;
import com.project.relentless.feature.wallet.Transaction;
import com.project.relentless.feature.wallet.TransactionRepository;
import com.project.relentless.feature.wallet.TransactionType;
import com.project.relentless.feature.wallet.WalletService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
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
  private final TransactionRepository transactionRepository;
  private final ReviewRepository reviewRepository;
  private final AmenityRepository amenityRepository;
  private final CategoryRepository categoryRepository;
  private final SpaceRepository spaceRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  @EventListener(ContextRefreshedEvent.class)
  public void init() {
    if (bookingRepository.count() > 0
        || transactionRepository.count() > 0
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
            .build();

    var host =
        User.builder()
            .username("host")
            .passwordHash(passwordEncoder.encode("P@ssw0rd"))
            .email("host@gmail.com")
            .firstName("John")
            .lastName("Doe")
            .phoneNumber("+48123456789")
            .iban("PL61109010140000071219812874")
            .dateOfBirth(LocalDate.of(2004, 11, 20))
            .dateAcceptedTerms(LocalDate.of(2026, 2, 18))
            .role(Role.HOST)
            .build();

    var admin =
        User.builder()
            .username("admin")
            .passwordHash(passwordEncoder.encode("P@ssw0rd"))
            .email("admin@gmail.com")
            .dateOfBirth(LocalDate.of(2005, 3, 7))
            .role(Role.ADMIN)
            .build();

    userRepository.saveAll(List.of(user, host, admin));

    var amenity1 = Amenity.builder().name("Wi-Fi").build();
    var amenity2 = Amenity.builder().name("Air Conditioning").build();
    var amenity3 = Amenity.builder().name("Parking").build();
    var amenity4 = Amenity.builder().name("Mirror").build();
    var amenity5 = Amenity.builder().name("Sound System").build();
    var amenity6 = Amenity.builder().name("Projector").build();
    var amenity7 = Amenity.builder().name("Soundproofing").build();
    var amenity8 = Amenity.builder().name("Natural Light").build();
    var amenity9 = Amenity.builder().name("Piano").build();
    var amenity10 = Amenity.builder().name("Heating").build();
    var amenity11 = Amenity.builder().name("Coffee Machine").build();
    var amenity12 = Amenity.builder().name("Smart TV").build();
    var amenity13 = Amenity.builder().name("Whiteboard").build();
    var amenity14 = Amenity.builder().name("Drum Kit").build();
    var amenity15 = Amenity.builder().name("Green Screen").build();
    var amenity16 = Amenity.builder().name("Lockers").build();
    var amenity17 = Amenity.builder().name("Security Cameras").build();

    amenityRepository.saveAll(
        List.of(
            amenity1, amenity2, amenity3, amenity4, amenity5, amenity6, amenity7, amenity8,
            amenity9, amenity10, amenity11, amenity12, amenity13, amenity14, amenity15, amenity16,
            amenity17));

    var category1 =
        Category.builder()
            .name("Dancing Studio")
            .description("An assembly hall with a large mirror")
            .build();

    var category2 = Category.builder().name("Vocal Studio").build();

    var category3 =
        Category.builder()
            .name("Recording Studio")
            .description("A soundproof room with a control desk and microphones")
            .build();

    var category4 =
        Category.builder()
            .name("Photo Studio")
            .description("A lit room with backdrops and softboxes")
            .build();

    var category5 = Category.builder().name("Yoga Studio").build();
    var category6 = Category.builder().name("Rehearsal Room").build();
    var category7 = Category.builder().name("Conference Room").build();

    var category8 =
        Category.builder()
            .name("Art Workshop")
            .description("A workshop with easels, sinks and storage")
            .build();

    categoryRepository.saveAll(
        List.of(
            category1, category2, category3, category4, category5, category6, category7,
            category8));

    var workingHours =
        Arrays.stream(DayOfWeek.values())
            .map(day -> WorkingHours.builder().dayOfWeek(day).build())
            .toList();

    var space1 =
        Space.builder()
            .name("MOVE DANCE STUDIO")
            .description("A spacious dance studio with a large mirror and wooden floors.")
            .address(
                Address.builder()
                    .street("Main St.")
                    .streetNumber("67")
                    .apartmentNumber("A")
                    .city("Warsaw")
                    .postalCode("00-120")
                    .country("Poland")
                    .build())
            .pricePerHour(new BigDecimal("25.00"))
            .publishedOn(LocalDate.of(2025, 12, 1))
            .workingHours(workingHours)
            .build();

    var space2 =
        Space.builder()
            .name("SING VOCAL STUDIO")
            .description("A cozy vocal studio with soundproof walls and a piano.")
            .address(
                Address.builder()
                    .street("Second St.")
                    .streetNumber("45")
                    .apartmentNumber("B")
                    .city("Warsaw")
                    .postalCode("00-130")
                    .country("Poland")
                    .build())
            .pricePerHour(new BigDecimal("40.00"))
            .publishedOn(LocalDate.of(2025, 11, 15))
            .workingHours(workingHours)
            .build();

    var space3 =
        Space.builder()
            .name("SOUND RECORDING")
            .description("A soundproof recording studio with a control room and a vocal booth.")
            .address(
                Address.builder()
                    .street("Third St.")
                    .streetNumber("12")
                    .city("Warsaw")
                    .postalCode("00-140")
                    .country("Poland")
                    .build())
            .pricePerHour(new BigDecimal("55.00"))
            .publishedOn(LocalDate.of(2026, 1, 10))
            .workingHours(workingHours)
            .build();

    var space4 =
        Space.builder()
            .name("LUMEN PHOTO STUDIO")
            .description("A bright photo studio with white cyclorama, softboxes and backdrops.")
            .address(
                Address.builder()
                    .street("Fourth St.")
                    .streetNumber("8")
                    .apartmentNumber("C")
                    .city("Krakow")
                    .postalCode("30-050")
                    .country("Poland")
                    .build())
            .pricePerHour(new BigDecimal("20.00"))
            .publishedOn(LocalDate.of(2026, 1, 22))
            .workingHours(workingHours)
            .build();

    var space5 =
        Space.builder()
            .name("ZEN YOGA LOFT")
            .description("A calm loft with mats, blocks and floor-to-ceiling windows.")
            .address(
                Address.builder()
                    .street("Fifth St.")
                    .streetNumber("101")
                    .city("Gdansk")
                    .postalCode("80-180")
                    .country("Poland")
                    .build())
            .pricePerHour(new BigDecimal("25.00"))
            .publishedOn(LocalDate.of(2026, 2, 3))
            .workingHours(workingHours)
            .build();

    var space6 =
        Space.builder()
            .name("AMP REHEARSAL ROOM")
            .address(
                Address.builder()
                    .street("Sixth St.")
                    .streetNumber("23")
                    .apartmentNumber("2")
                    .city("Wroclaw")
                    .postalCode("50-070")
                    .country("Poland")
                    .build())
            .pricePerHour(new BigDecimal("50.00"))
            .publishedOn(LocalDate.of(2026, 2, 14))
            .workingHours(workingHours)
            .build();

    var space7 =
        Space.builder()
            .name("NEXUS CONFERENCE ROOM")
            .description("A meeting room for twelve people with a projector and a whiteboard.")
            .address(
                Address.builder()
                    .street("Seventh St.")
                    .streetNumber("5")
                    .apartmentNumber("14")
                    .city("Poznan")
                    .postalCode("61-001")
                    .country("Poland")
                    .build())
            .pricePerHour(new BigDecimal("35.00"))
            .publishedOn(LocalDate.of(2026, 3, 1))
            .workingHours(workingHours)
            .build();

    var space8 =
        Space.builder()
            .name("PALETTE ART WORKSHOP")
            .description("An art workshop with easels, a sink and storage for materials.")
            .address(
                Address.builder()
                    .street("Eighth St.")
                    .streetNumber("77")
                    .city("Lodz")
                    .postalCode("90-001")
                    .country("Poland")
                    .build())
            .pricePerHour(new BigDecimal("20.00"))
            .publishedOn(LocalDate.of(2026, 3, 12))
            .workingHours(workingHours)
            .build();

    var spaces = List.of(space1, space2, space3, space4, space5, space6, space7, space8);

    spaces.forEach(space -> space.setHost(host));

    spaceRepository.saveAll(spaces);

    space1.setCategory(category1);
    space2.setCategory(category2);
    space3.setCategory(category3);
    space4.setCategory(category4);
    space5.setCategory(category5);
    space6.setCategory(category6);
    space7.setCategory(category7);
    space8.setCategory(category8);

    space1.setAmenities(
        Set.of(amenity1, amenity2, amenity4, amenity5, amenity8, amenity10, amenity16));
    space2.setAmenities(Set.of(amenity2, amenity3, amenity5, amenity7, amenity9, amenity10));
    space3.setAmenities(
        Set.of(amenity1, amenity2, amenity5, amenity7, amenity9, amenity12, amenity17));
    space4.setAmenities(Set.of(amenity1, amenity3, amenity8, amenity11, amenity15, amenity17));
    space5.setAmenities(
        Set.of(amenity1, amenity2, amenity3, amenity4, amenity8, amenity10, amenity16));
    space6.setAmenities(Set.of(amenity3, amenity5, amenity7, amenity14));
    space7.setAmenities(
        Set.of(amenity1, amenity2, amenity3, amenity6, amenity8, amenity11, amenity12, amenity13));
    space8.setAmenities(Set.of(amenity1, amenity8, amenity10, amenity11, amenity16));

    spaceRepository.saveAll(spaces);

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
            .checkoutSessionUrl("https://checkout.stripe.com/pay/cs_test_1a2b3c4d5e6f7g8h")
            .status(BookingStatus.COMPLETED)
            .build();

    bookingRepository.save(booking);

    var amount =
        booking
            .getTotalPrice()
            .multiply(WalletService.HOST_KEEP_RATE)
            .setScale(2, RoundingMode.HALF_UP);

    var transaction =
        Transaction.builder()
            .amount(amount)
            .createdAt(LocalDateTime.of(2026, 3, 6, 14, 0))
            .type(TransactionType.CREDIT)
            .host(host)
            .booking(booking)
            .build();

    transactionRepository.save(transaction);

    var review =
        Review.builder()
            .rating(5)
            .comment("Great place!")
            .createdAt(LocalDateTime.of(2026, 3, 7, 19, 0))
            .build();

    review.setBooking(booking);

    reviewRepository.save(review);

    space1.setRating(5);
    space1.setReviewCount(1);

    spaceRepository.save(space1);

    log.info("Database initialized.");
  }
}
