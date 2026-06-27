package com.project.relentless.feature.image;

import com.project.relentless.feature.image.dto.response.UploadImageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

  private final ImageService imageService;

  @GetMapping("/{key}")
  public ResponseEntity<InputStreamResource> getByKey(@PathVariable String key) {
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
        .contentType(MediaType.IMAGE_JPEG)
        .body(new InputStreamResource(imageService.getByKey(key)));
  }

  @PostMapping("/upload")
  public ResponseEntity<UploadImageResponse> upload(@RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(imageService.upload(file));
  }
}
