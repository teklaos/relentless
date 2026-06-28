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
    String mediaType;

    if (key.toLowerCase().endsWith(".png")) {
      mediaType = "image/png";
    } else if (key.toLowerCase().endsWith(".webp")) {
      mediaType = "image/webp";
    } else {
      mediaType = "image/jpeg";
    }

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
        .contentType(MediaType.parseMediaType(mediaType))
        .body(new InputStreamResource(imageService.getByKey(key)));
  }

  @PostMapping
  public ResponseEntity<UploadImageResponse> upload(@RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(imageService.upload(file));
  }

  @DeleteMapping("/{key}")
  public ResponseEntity<Void> deleteByKey(@PathVariable String key) {
    imageService.deleteByKey(key);
    return ResponseEntity.noContent().build();
  }
}
