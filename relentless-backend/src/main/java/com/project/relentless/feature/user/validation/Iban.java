package com.project.relentless.feature.user.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.Pattern;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = {})
@Pattern(
    regexp = "^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$",
    message =
        "IBAN must be 15-34 characters long, start with two uppercase letters and two digits, followed by uppercase letters or digits, and contain no whitespaces.")
public @interface Iban {
  String message() default "Invalid IBAN";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};
}
