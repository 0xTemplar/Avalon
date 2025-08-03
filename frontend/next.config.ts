import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ['avatars.dicebear.com', 'avatars.githubusercontent.com', 'images.unsplash.com'],
  },
};

export default nextConfig;
