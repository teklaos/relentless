package com.project.relentless.feature.user;

import com.project.relentless.feature.user.dto.request.ChangePasswordRequest;
import com.project.relentless.feature.user.dto.request.EditUserRequest;
import com.project.relentless.feature.user.dto.response.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

  private final UserService userService;

  @GetMapping("/me")
  public ResponseEntity<UserResponse> getCurrent() {
    return ResponseEntity.ok(userService.getCurrent());
  }

  @GetMapping("/{id}")
  public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
    return ResponseEntity.ok(userService.getById(id));
  }

  @PatchMapping("/me")
  public ResponseEntity<UserResponse> editCurrent(@Valid @RequestBody EditUserRequest request) {
    return ResponseEntity.ok(userService.editCurrent(request));
  }

  @PatchMapping("/me/password")
  public ResponseEntity<Void> changeCurrentPassword(
      @Valid @RequestBody ChangePasswordRequest request) {
    userService.changeCurrentPassword(request);
    return ResponseEntity.ok().build();
  }

  @DeleteMapping("/me")
  public ResponseEntity<Void> deleteCurrent() {
    userService.deleteCurrent();
    return ResponseEntity.noContent().build();
  }
}
