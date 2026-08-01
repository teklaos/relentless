package com.project.relentless.feature.user;

import com.project.relentless.feature.auth.AuthService;
import com.project.relentless.feature.auth.details.CustomUserDetails;
import com.project.relentless.feature.auth.refresh.RefreshTokenService;
import com.project.relentless.feature.user.dto.request.ChangePasswordRequest;
import com.project.relentless.feature.user.dto.request.EditUserRequest;
import com.project.relentless.feature.user.dto.response.UserResponse;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserRepository userRepository;
  private final UserMapper userMapper;
  private final AuthService authService;
  private final RefreshTokenService refreshTokenService;
  private final PasswordEncoder passwordEncoder;

  @Override
  public UserResponse getCurrent() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
      throw new AuthenticationCredentialsNotFoundException("Unauthorized");
    }
    CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
    if (userDetails == null) {
      throw new AuthenticationCredentialsNotFoundException("Unauthorized");
    }
    return userMapper.toUserResponse(userDetails.user());
  }

  @Override
  public UserResponse getById(Long id) {
    var user =
        userRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

    return userMapper.toUserResponse(user);
  }

  @Override
  @Transactional
  public UserResponse editCurrent(EditUserRequest request) {
    Long userId = authService.getCurrentUserId();
    var user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

    if (request.username() != null) {
      user.setUsername(request.username());
    }
    if (request.email() != null && !request.email().equals(user.getEmail())) {
      if (userRepository.findByEmail(request.email()).isPresent()) {
        throw new EntityExistsException("Email is already in use");
      }
      user.setEmail(request.email());
    }
    if (request.dateOfBirth() != null) {
      user.setDateOfBirth(request.dateOfBirth());
    }
    if (request.profileImageKey() != null) {
      user.setProfileImageKey(request.profileImageKey());
    }

    return userMapper.toUserResponse(userRepository.save(user));
  }

  @Override
  @Transactional
  public void changeCurrentPassword(ChangePasswordRequest request) {
    Long userId = authService.getCurrentUserId();
    var user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

    if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
      throw new IllegalArgumentException("Current password is incorrect");
    }

    user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    userRepository.save(user);
  }

  @Override
  @Transactional
  public void deleteCurrent() {
    Long userId = authService.getCurrentUserId();
    var user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

    user.setEmail("deleted-user-" + userId + "@deleted.local");
    user.setUsername("Deleted User");
    user.setDateOfBirth(null);
    user.setPasswordHash(null);

    user.setFirstName(null);
    user.setLastName(null);
    user.setPhoneNumber(null);
    user.setIban(null);

    user.setProfileImageKey(null);
    refreshTokenService.deleteAllByUserId(userId);

    user.setDeleted(true);
    userRepository.save(user);
  }
}
