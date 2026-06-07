package com.project.relentless.feature.user;

import com.project.relentless.feature.auth.details.CustomUserDetails;
import com.project.relentless.feature.user.dto.request.EditUserRequest;
import com.project.relentless.feature.user.dto.response.UserResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserRepository userRepository;
  private final UserMapper userMapper;

  @Override
  public UserResponse getCurrent() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
      throw new AuthenticationCredentialsNotFoundException("Unauthorized");
    }
    CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
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
  public UserResponse update(Long id, EditUserRequest request) {
    var user =
        userRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

    if (request.username() != null) {
      user.setUsername(request.username());
    }
    if (request.email() != null) {
      user.setEmail(request.email());
    }
    if (request.dateOfBirth() != null) {
      user.setDateOfBirth(request.dateOfBirth());
    }

    return userMapper.toUserResponse(userRepository.save(user));
  }
}
