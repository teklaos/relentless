package com.project.relentless.feature.user;

import com.project.relentless.feature.auth.refresh.RefreshToken;
import com.project.relentless.feature.booking.entity.Booking;
import com.project.relentless.feature.space.entity.Space;
import com.project.relentless.feature.user.validation.Iban;
import com.project.relentless.feature.user.validation.PhoneNumber;
import com.project.relentless.feature.wallet.Transaction;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDate;
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
@Table(name = "app_user")
@Builder
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank(message = "Username is required.")
  @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters.")
  private String username;

  @Size(min = 1, max = 255, message = "Password hash must be between 1 and 255 characters.")
  private String passwordHash;

  @NotBlank(message = "Email is required.")
  @Column(unique = true)
  @Size(min = 3, max = 100, message = "Email must be between 3 and 100 characters.")
  @Email(message = "Invalid email format.")
  private String email;

  @Size(min = 2, max = 255, message = "First name must be between 2 and 255 characters.")
  private String firstName;

  @Size(min = 2, max = 255, message = "Last name must be between 2 and 255 characters.")
  private String lastName;

  @PhoneNumber(message = "Invalid phone number format.")
  private String phoneNumber;

  @Iban(message = "Invalid IBAN format.")
  private String iban;

  @PastOrPresent(message = "Date of birth must be in the past or present.")
  private LocalDate dateOfBirth;

  @NotNull(message = "Date of joining is required.")
  @PastOrPresent(message = "Date of joining must be in the past or present.")
  @Builder.Default
  private LocalDate dateJoined = LocalDate.now();

  @PastOrPresent(message = "Date of accepting terms must be in the past or present.")
  private LocalDate dateAcceptedTerms;

  @Size(min = 3, max = 255, message = "Profile image key must be between 3 and 255 characters.")
  private String profileImageKey;

  @NotNull(message = "Role is required.")
  @Enumerated(EnumType.STRING)
  @Builder.Default
  private Role role = Role.USER;

  @NotNull(message = "Is deleted flag is required.")
  @Builder.Default
  private boolean isDeleted = false;

  @OneToMany(mappedBy = "user")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  @Builder.Default
  private Set<Booking> bookings = new HashSet<>();

  @OneToMany(mappedBy = "host")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  @Builder.Default
  private Set<Space> spaces = new HashSet<>();

  @OneToMany(mappedBy = "user")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  @Builder.Default
  private Set<RefreshToken> refreshTokens = new HashSet<>();

  @OneToMany(mappedBy = "host")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  @Builder.Default
  private Set<Transaction> transactions = new HashSet<>();

  @ManyToMany
  @JoinTable(
      name = "user_space",
      joinColumns = @JoinColumn(name = "user_id"),
      inverseJoinColumns = @JoinColumn(name = "space_id"))
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  @Builder.Default
  private Set<Space> savedSpaces = new HashSet<>();

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
    User user = (User) o;
    return getId() != null && Objects.equals(getId(), user.getId());
  }

  @Override
  public final int hashCode() {
    Object o = this;
    if (this instanceof HibernateProxy) {
      o = ((HibernateProxy) this).getHibernateLazyInitializer().getImplementation();
    }
    Serializable id = ((User) o).getId();
    return id != null ? id.hashCode() : super.hashCode();
  }
}
