package com.project.relentless.feature.wallet;

import com.project.relentless.feature.booking.entity.Booking;
import com.project.relentless.feature.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull(message = "Amount is required.")
  @Positive(message = "Amount must be positive.")
  @Digits(
      integer = 10,
      fraction = 2,
      message = "Amount must be a valid number with up to 2 decimal places.")
  private BigDecimal amount;

  @NotNull(message = "Creation time is required.")
  @PastOrPresent(message = "Creation time must be in the past or present.")
  @Builder.Default
  private LocalDateTime createdAt = LocalDateTime.now();

  @NotNull(message = "Transaction type is required.")
  @Enumerated(EnumType.STRING)
  private TransactionType type;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "host_id", nullable = false, updatable = false)
  private User host;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "booking_id", unique = true, updatable = false)
  private Booking booking;

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
    Transaction transaction = (Transaction) o;
    return getId() != null && Objects.equals(getId(), transaction.getId());
  }

  @Override
  public final int hashCode() {
    Object o = this;
    if (this instanceof HibernateProxy) {
      o = ((HibernateProxy) this).getHibernateLazyInitializer().getImplementation();
    }
    Serializable id = ((Transaction) o).getId();
    return id != null ? id.hashCode() : super.hashCode();
  }
}
