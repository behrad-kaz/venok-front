// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'],
  },
  // ✅ اجازه دسترسی به فایل‌های استاتیک
  async rewrites() {
    return [
      {
        source: '/files/:path*',
        destination: 'http://localhost:3000/files/:path*',
      },
    ];
  },
};

export default nextConfig;