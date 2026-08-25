package com.project.relentless.feature.space.entity;

import com.project.relentless.feature.booking.entity.Booking;
import com.project.relentless.feature.space.SpaceStatus;
import com.project.relentless.feature.user.User;
import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(indexes = @Index(name = "idx_space_host", columnList = "host_id"))
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
  @DecimalMin(value = "1.00", message = "Price per hour must be at least 1.")
  @Digits(
      integer = 10,
      fraction = 2,
      message = "Price per hour must be a valid number with up to 2 decimal places.")
  private BigDecimal pricePerHour;

  @NotEmpty(message = "Working hours are required.")
  @Valid
  @ElementCollection
  @CollectionTable(name = "space_hours", joinColumns = @JoinColumn(name = "space_id"))
  @Builder.Default
  private List<WorkingHours> workingHours = new ArrayList<>();

  @NotNull(message = "Publication date is required.")
  @PastOrPresent(message = "Publication date must be in the past or present.")
  @Builder.Default
  private LocalDate publishedOn = LocalDate.now();

  @NotNull(message = "Status is required.")
  @Enumerated(EnumType.STRING)
  @Builder.Default
  private SpaceStatus status = SpaceStatus.ACTIVE;

  @PositiveOrZero(message = "Rating must be positive.")
  @Builder.Default
  private double rating = 0.0;

  @PositiveOrZero(message = "Review count must be positive.")
  @Builder.Default
  private int reviewCount = 0;

  @ElementCollection
  @CollectionTable(name = "space_image", joinColumns = @JoinColumn(name = "space_id"))
  @Column(name = "image_key")
  @OrderColumn(name = "position")
  @Builder.Default
  private List<String> imageKeys = new ArrayList<>();

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

  @Override
  public final boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null) {
      return false;
    }
    Class<?> oClass;
    if (o instanceof HibernateProxy) {
      oClass = ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass();
    } else {
      oClass = o.getClass();
    }
    Class<?> thisClass;
    if (this instanceof HibernateProxy) {
      thisClass = ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass();
    } else {
      thisClass = this.getClass();
    }
    if (thisClass != oClass) {
      return false;
    }
    Space space = (Space) o;
    return getId() != null && Objects.equals(getId(), space.getId());
  }

  @Override
  public final int hashCode() {
    Object o = this;
    if (this instanceof HibernateProxy) {
      o = ((HibernateProxy) this).getHibernateLazyInitializer().getImplementation();
    }
    Serializable id = ((Space) o).getId();
    return id != null ? id.hashCode() : super.hashCode();
  }
}
