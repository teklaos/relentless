package com.project.relentless.feature.user;

import com.project.relentless.feature.user.dto.response.UserResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserRepository userRepository;
  private final UserMapper userMapper;

  @Override
  public UserResponse getById(Long id) {
    var user =
        userRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

    return userMapper.toUserResponse(user);
  }
}
