// next.config.ts
import type { NextConfig } from "next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

const nextConfig: NextConfig = {
  images: {
    domains: ["localhost"],
  },
  // ✅ اجازه دسترسی به فایل‌های استاتیک
  async rewrites() {
    return [
      {
        source: "/files/:path*",
        destination: `${API_BASE_URL}/files/:path*`,
      },
    ];
  },
};

export default nextConfig;