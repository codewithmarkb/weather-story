import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "10.1.1.55",
    "10.1.1.55:3000",
    "localhost",
    "localhost:3000",
  ],
};

export default nextConfig;
