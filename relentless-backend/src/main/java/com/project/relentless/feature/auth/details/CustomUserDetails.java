package com.project.relentless.feature.auth.details;

import com.project.relentless.feature.user.User;
import java.util.Collection;
import java.util.List;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@NullMarked
public record CustomUserDetails(User user) implements UserDetails {

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
  }

  @Override
  public String getUsername() {
    return user.getEmail();
  }

  @Override
  public String getPassword() {
    return user.getPasswordHash();
  }

  @Override
  public boolean isEnabled() {
    return !user.isDeleted();
  }

  public Long getId() {
    return user.getId();
  }
}
