import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8080", pathname: "/api/images/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8080", pathname: "/api/images/**" },
    ],
  },
};

export default nextConfig;
