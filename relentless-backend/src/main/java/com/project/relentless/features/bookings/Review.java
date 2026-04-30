package com.project.relentless.features.bookings;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
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
public class Review {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull(message = "Rating is required.")
  @Min(value = 1, message = "Rating must be at least 1.")
  @Max(value = 5, message = "Rating must be at most 5.")
  private int rating;

  @NotBlank(message = "Comment is required.")
  @Size(min = 1, max = 255, message = "Comment must be between 1 and 255 characters.")
  private String comment;

  @NotNull(message = "Time of creation is required.")
  @PastOrPresent(message = "Time of creation must be in the past or present.")
  private LocalDateTime createdAt;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "booking_id", nullable = false)
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
    Review review = (Review) o;
    return getId() != null && Objects.equals(getId(), review.getId());
  }

  @Override
  public final int hashCode() {
    Object o = this;
    if (this instanceof HibernateProxy) {
      o = ((HibernateProxy) this).getHibernateLazyInitializer().getImplementation();
    }
    Serializable id = ((Review) o).getId();
    return id != null ? id.hashCode() : super.hashCode();
  }
}
