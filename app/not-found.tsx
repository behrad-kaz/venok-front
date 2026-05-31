// app/not-found.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowRight, Search, Sparkles } from "lucide-react";

export default function GlobalNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a3833] to-[#020807] flex items-center justify-center px-4 relative overflow-hidden">
      {/* دایره‌های محو در پس‌زمینه */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full opacity-10 bg-[#59D8C3] blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full opacity-8 bg-[#5BE0A8] blur-3xl" />

      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* لوگو */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-[#59D8C3]/20 to-[#5BE0A8]/20 rounded-2xl flex items-center justify-center border border-[#59D8C3]/30">
            <Sparkles className="w-10 h-10 text-[#59D8C3]" />
          </div>
        </div>

        {/* عدد ۴۰۴ با استایل خاص */}
        <div className="relative mb-6">
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] bg-clip-text text-transparent">
            ۴۰۴
          </h1>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-[#59D8C3] to-transparent" />
        </div>

        {/* عنوان و توضیحات */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          صفحه‌ای که به دنبال آن بودید پیدا نشد!
        </h2>
        <p className="text-gray-400 text-base md:text-lg mb-8 leading-relaxed">
          متأسفیم، صفحه‌ای که به دنبال آن هستید وجود ندارد یا به مسیر دیگری منتقل شده است.
        </p>

        {/* دکمه‌های اقدام */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl bg-[#12251F] border border-[#59D8C3]/20 text-white hover:border-[#59D8C3]/40 hover:bg-[#1A352B] transition-all duration-300 flex items-center gap-2 group"
          >
            <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>بازگشت به صفحه قبل</span>
          </button>

          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] font-medium hover:shadow-lg hover:shadow-[#59D8C3]/25 transition-all duration-300 flex items-center gap-2 group"
          >
            <Home className="w-4 h-4" />
            <span>صفحه اصلی</span>
          </Link>
        </div>

        {/* پیشنهادات */}
        <div className="bg-[#0D1B17]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#59D8C3]/20">
          <div className="flex items-center gap-2 justify-center mb-4">
            <Search className="w-5 h-5 text-[#59D8C3]" />
            <h3 className="text-white font-semibold">شاید این صفحات مورد نظر شما باشند:</h3>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-[#12251F] text-gray-300 text-sm hover:text-[#59D8C3] transition-colors"
            >
              داشبورد
            </Link>
            <Link
              href="/dashboard/requests"
              className="px-4 py-2 rounded-xl bg-[#12251F] text-gray-300 text-sm hover:text-[#59D8C3] transition-colors"
            >
              درخواست‌ها
            </Link>
            <Link
              href="/dashboard/conversations"
              className="px-4 py-2 rounded-xl bg-[#12251F] text-gray-300 text-sm hover:text-[#59D8C3] transition-colors"
            >
              گفتگوها
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-[#12251F] text-gray-300 text-sm hover:text-[#59D8C3] transition-colors"
            >
              ورود به حساب
            </Link>
          </div>
        </div>

        {/* متن پایانی */}
        <p className="text-xs text-gray-600 mt-8">
          خطای ۴۰۴ - صفحه مورد نظر یافت نشد
        </p>
      </div>
    </div>
  );
}