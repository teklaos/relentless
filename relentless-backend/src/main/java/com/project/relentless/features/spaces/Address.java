package com.project.relentless.features.spaces;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

  @NotBlank(message = "Street is required.")
  @Size(min = 1, max = 100, message = "Street must be between 1 and 50 characters.")
  private String street;

  @NotNull(message = "Street number is required.")
  @Size(min = 1, max = 10, message = "Street number must be between 1 and 10 characters.")
  private String streetNumber;

  @Size(min = 1, max = 10, message = "Unit number must be between 1 and 10 characters.")
  private String unitNumber;

  @NotBlank(message = "Postal code is required.")
  @Size(min = 3, max = 10, message = "Postal code must be between 3 and 10 characters.")
  private String postalCode;

  @NotBlank(message = "City is required.")
  @Size(min = 1, max = 50, message = "City must be between 1 and 50 characters.")
  private String city;

  @NotBlank(message = "Country is required.")
  @Size(min = 1, max = 50, message = "Country must be between 1 and 50 characters.")
  private String country;
}
