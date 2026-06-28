package com.project.relentless.feature.image;

import com.project.relentless.feature.image.dto.response.UploadImageResponse;
import io.minio.*;
import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.net.ConnectException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.http.fileupload.impl.InvalidContentTypeException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageServiceImpl implements ImageService {

  private final MinioClient minioClient;
  private static final String BUCKET = "images";

  @PostConstruct
  void init() {
    try {
      boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(BUCKET).build());
      if (!exists) {
        minioClient.makeBucket(MakeBucketArgs.builder().bucket(BUCKET).build());
      }
    } catch (ConnectException ex) {
      log.warn("Could not connect to MinIO: {}", ex.getMessage());
    } catch (Exception ex) {
      log.warn("MinIO bucket init failed: {}", ex.getMessage());
    }
  }

  @Override
  @SneakyThrows
  public InputStream getByKey(String key) {
    return minioClient.getObject(GetObjectArgs.builder().bucket(BUCKET).object(key).build());
  }

  @Override
  @SneakyThrows
  public UploadImageResponse upload(MultipartFile file) {
    String contentType = file.getContentType();
    if (contentType == null) {
      throw new InvalidContentTypeException("No content type");
    }

    String extension =
        switch (contentType) {
          case "image/jpeg" -> ".jpg";
          case "image/png" -> ".png";
          case "image/webp" -> ".webp";
          default -> throw new InvalidContentTypeException("Invalid content type: " + contentType);
        };

    String key = UUID.randomUUID() + extension;
    try (InputStream in = file.getInputStream()) {
      minioClient.putObject(
          PutObjectArgs.builder().bucket(BUCKET).object(key).stream(in, file.getSize(), -1)
              .contentType(contentType)
              .build());
    }

    return new UploadImageResponse(key);
  }

  @Override
  @SneakyThrows
  public void deleteByKey(String key) {
    minioClient.removeObject(RemoveObjectArgs.builder().bucket(BUCKET).object(key).build());
  }
}
