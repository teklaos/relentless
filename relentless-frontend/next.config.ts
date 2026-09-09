import type { NextConfig } from "next";

const api = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080");
const isLocal = api.hostname === "localhost" || api.hostname === "127.0.0.1";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: isLocal,
    remotePatterns: [
      {
        protocol: api.protocol.replace(":", "") as "http" | "https",
        hostname: api.hostname,
        port: api.port,
        pathname: "/api/images/**",
      },
    ],
  },
};

export default nextConfig;