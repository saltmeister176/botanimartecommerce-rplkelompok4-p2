import type { NextConfig } from "next";

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
}

export default nextConfig as NextConfig;


