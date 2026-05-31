// components/dashboard/NotFound.tsx
"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <ShieldAlert className="w-10 h-10 text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">دسترسی غیرمجاز</h2>
      <p className="text-gray-400 mb-6 max-w-md">
        شما به این بخش دسترسی ندارید. لطفاً با نقش مناسب وارد شوید.
      </p>
      <Link
        href="/dashboard"
        className="px-4 py-2 bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] rounded-lg hover:shadow-lg transition-all duration-300"
      >
        بازگشت به داشبورد
      </Link>
    </div>
  );
}