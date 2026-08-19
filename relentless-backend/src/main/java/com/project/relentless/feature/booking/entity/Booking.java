package com.project.relentless.feature.booking.entity;

import com.project.relentless.feature.booking.BookingStatus;
import com.project.relentless.feature.space.entity.Space;
import com.project.relentless.feature.user.User;
import com.project.relentless.feature.wallet.Transaction;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull(message = "Start time is required.")
  private LocalDateTime startTime;

  @NotNull(message = "End time is required.")
  private LocalDateTime endTime;

  @NotNull(message = "Total price is required.")
  @Positive(message = "Total price must be positive.")
  @Digits(
      integer = 10,
      fraction = 2,
      message = "Total price must be a valid number with up to 2 decimal places.")
  private BigDecimal totalPrice;

  @Size(
      min = 2,
      max = 1000,
      message = "Checkout session URL must be between 2 and 1023 characters.")
  private String checkoutSessionUrl;

  @NotNull(message = "Creation time is required.")
  @PastOrPresent(message = "Creation time must be in the past or present.")
  @Builder.Default
  private LocalDateTime createdAt = LocalDateTime.now();

  @NotNull(message = "Booking status is required.")
  @Enumerated(EnumType.STRING)
  @Builder.Default
  private BookingStatus status = BookingStatus.PENDING;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, updatable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "space_id", nullable = false, updatable = false)
  private Space space;

  @OneToOne(mappedBy = "booking", cascade = CascadeType.REMOVE, orphanRemoval = true)
  private Review review;

  @OneToMany(mappedBy = "booking")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  @Builder.Default
  private Set<Transaction> transactions = new HashSet<>();

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
    Booking booking = (Booking) o;
    return getId() != null && Objects.equals(getId(), booking.getId());
  }

  @Override
  public final int hashCode() {
    Object o = this;
    if (this instanceof HibernateProxy) {
      o = ((HibernateProxy) this).getHibernateLazyInitializer().getImplementation();
    }
    Serializable id = ((Booking) o).getId();
    return id != null ? id.hashCode() : super.hashCode();
  }
}
