import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  experimental: {
    cpus: process.env.GUYUB_BUILD_CPUS === "1" ? 1 : undefined,
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
