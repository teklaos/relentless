package com.project.relentless.feature.image;

import com.project.relentless.feature.image.dto.response.UploadImageResponse;
import java.io.InputStream;
import org.springframework.web.multipart.MultipartFile;

public interface ImageService {
  InputStream getByKey(String key);

  UploadImageResponse upload(MultipartFile file);

  void deleteByKey(String key);
}
