package com.project.relentless.features.spaces;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
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
public class Category {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank(message = "Name is required.")
  @Size(min = 1, max = 50, message = "Name must be between 1 and 50 characters.")
  private String name;

  @NotBlank(message = "Description is required.")
  @Size(min = 1, max = 255, message = "Description must be between 1 and 255 characters.")
  private String description;

  @OneToMany(mappedBy = "category")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  @Builder.Default
  private Set<Space> spaces = new HashSet<>();

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
    Category category = (Category) o;
    return getId() != null && Objects.equals(getId(), category.getId());
  }

  @Override
  public final int hashCode() {
    Object o = this;
    if (this instanceof HibernateProxy) {
      o = ((HibernateProxy) this).getHibernateLazyInitializer().getImplementation();
    }
    Serializable id = ((Category) o).getId();
    return id != null ? id.hashCode() : super.hashCode();
  }
}
