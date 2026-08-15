package com.project.relentless.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import org.jspecify.annotations.NullMarked;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@NullMarked
@Component
public class RateLimitFilter extends OncePerRequestFilter {

  private final Cache<String, Bucket> buckets =
      Caffeine.newBuilder().expireAfterAccess(Duration.ofMinutes(10)).maximumSize(100_000).build();

  private static final long MAX_REQUESTS_PER_MINUTE = 150;
  private static final long MAX_AUTH_REQUESTS_PER_MINUTE = 25;
  private static final long MAX_IMAGE_REQUESTS_PER_MINUTE = 500;

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return request.getRequestURI().startsWith("/api/payments/webhook");
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    var capacity = getCapacity(request);
    var bucket = buckets.get(capacity + ":" + getClientIp(request), _ -> getNewBucket(capacity));
    var probe = bucket.tryConsumeAndReturnRemaining(1);

    if (probe.isConsumed()) {
      response.setHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
      filterChain.doFilter(request, response);
    } else {
      long waitSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000;
      response.setStatus(429);
      response.setHeader("Retry-After", String.valueOf(waitSeconds));
      response.setContentType("application/json");
      response.getWriter().write("{\"error\": \"Too Many Requests\"}");
    }
  }

  private long getCapacity(HttpServletRequest request) {
    if (request.getRequestURI().startsWith("/api/auth")) {
      return MAX_AUTH_REQUESTS_PER_MINUTE;
    }
    if (request.getRequestURI().startsWith("/api/images")) {
      return MAX_IMAGE_REQUESTS_PER_MINUTE;
    }
    return MAX_REQUESTS_PER_MINUTE;
  }

  private String getClientIp(HttpServletRequest request) {
    String header = request.getHeader("X-Forwarded-For");
    if (header == null || header.isBlank()) {
      return request.getRemoteAddr();
    }
    return header.split(",")[0].trim();
  }

  private Bucket getNewBucket(long capacity) {
    return Bucket.builder()
        .addLimit(l -> l.capacity(capacity).refillGreedy(capacity, Duration.ofMinutes(1)))
        .build();
  }
}
