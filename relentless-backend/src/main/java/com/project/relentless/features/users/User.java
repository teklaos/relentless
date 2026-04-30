package com.project.relentless.features.users;

import com.project.relentless.features.bookings.Booking;
import com.project.relentless.features.spaces.Space;
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
  @Size(min = 1, max = 50, message = "Username must be between 1 and 50 characters.")
  private String username;

  @NotBlank(message = "Password hash is required.")
  @Size(min = 1, max = 255, message = "Password hash must be between 1 and 255 characters.")
  private String passwordHash;

  @NotBlank(message = "Email is required.")
  @Column(unique = true)
  @Size(min = 1, max = 255, message = "Email must be between 1 and 75 characters.")
  @Email(message = "Invalid email format.")
  private String email;

  @NotNull(message = "Date of birth is required.")
  @PastOrPresent(message = "Date of birth must be in the past or present.")
  private LocalDate dateOfBirth;

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
