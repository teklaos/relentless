package com.project.relentless.features.spaces;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.HashSet;
import java.util.Set;
import lombok.*;

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
}
