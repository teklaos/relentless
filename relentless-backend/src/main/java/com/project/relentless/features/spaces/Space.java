package com.project.relentless.features.spaces;

import com.project.relentless.features.bookings.Booking;
import com.project.relentless.features.users.User;
import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Space {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank(message = "Name is required.")
  @Size(min = 1, max = 50, message = "Name must be between 1 and 50 characters.")
  private String name;

  @Size(min = 1, max = 255, message = "Description must be between 1 and 255 characters.")
  private String description;

  @NotNull(message = "Address is required.")
  @Valid
  @Embedded
  private Address address;

  @NotNull(message = "Price per hour is required.")
  @PositiveOrZero(message = "Price per hour must be positive.")
  @Digits(
      integer = 10,
      fraction = 2,
      message = "Price per hour must be a valid number with up to 2 decimal places.")
  private BigDecimal pricePerHour;

  @NotNull(message = "Publication date is required.")
  @PastOrPresent(message = "Publication date must be in the past or present.")
  private LocalDate publishedOn;

  @NotNull(message = "Is deleted flag is required.")
  @Builder.Default
  private boolean isDeleted = false;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "host_id", nullable = false)
  private User host;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id")
  private Category category;

  @OneToMany(mappedBy = "space")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  @Builder.Default
  private Set<Booking> bookings = new HashSet<>();

  @ManyToMany
  @JoinTable(
      name = "space_amenity",
      joinColumns = @JoinColumn(name = "space_id"),
      inverseJoinColumns = @JoinColumn(name = "amenity_id"))
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  @Builder.Default
  private Set<Amenity> amenities = new HashSet<>();

  @ManyToMany(mappedBy = "savedSpaces")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  @Builder.Default
  private Set<User> savedBy = new HashSet<>();
}
