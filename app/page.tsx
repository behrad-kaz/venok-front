// app/page.tsx
import Link from "next/link";
import { MessageCircle, Lock, LayoutDashboard, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10221f] to-[#020807] flex flex-col items-center justify-center px-4 gap-8 relative overflow-hidden">
      {/* دایره‌های محو در پس‌زمینه */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#2a413d5e] rounded-full blur-3xl" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#2849445e] rounded-full blur-3xl" />
      </div>

      {/* لوگو و عنوان */}
      <div className="relative text-center space-y-3">
        <div className="w-20 h-20 rounded-2xl bg-[#59D8C3]/10 border border-[#59D8C3]/25 flex items-center justify-center mx-auto shadow-[0_0_48px_rgba(89,216,195,0.2)]">
          <MessageCircle className="w-9 h-9 text-[#59D8C3]" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-bold text-white">پشتیبان‌یار</h1>
        <p className="text-base text-gray-400 max-w-md mx-auto leading-relaxed">
          پلتفرم حرفه‌ای مدیریت پشتیبانی مشتریان — نمایش تعاملی محصول
        </p>
      </div>

      {/* سه کارت اصلی */}
      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {/* کارت اول - صفحه چت مشتری */}
        <Link
          href="/conversations/client"
          className="group bg-[#0D1B17]/90 backdrop-blur-sm border border-[#59D8C3]/20 rounded-2xl p-6 text-right hover:border-[#59D8C3]/40 hover:shadow-[0_0_40px_rgba(89,216,195,0.1)] transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#59D8C3]/10 border border-[#59D8C3]/20 flex items-center justify-center group-hover:bg-[#59D8C3]/15 transition-colors">
              <MessageCircle className="w-6 h-6 text-[#59D8C3]" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5BE0A8]/10 text-[#5BE0A8] border border-[#5BE0A8]/25">
              مشتری
            </span>
          </div>
          <h3 className="text-sm font-bold text-white mb-1.5">صفحه چت مشتری</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            صفحه گفتگو پس از دریافت لینک SMS با ۶ حالت مختلف
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-[#59D8C3] group-hover:gap-2.5 transition-all">
            <span>مشاهده</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </Link>

        {/* کارت دوم - ورود به ورک‌اسپیس */}
        <Link
          href="/login"
          className="group bg-[#0D1B17]/90 backdrop-blur-sm border border-[#59D8C3]/20 rounded-2xl p-6 text-right hover:border-[#59D8C3]/40 hover:shadow-[0_0_40px_rgba(89,216,195,0.1)] transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#59D8C3]/10 border border-[#59D8C3]/20 flex items-center justify-center group-hover:bg-[#59D8C3]/15 transition-colors">
              <Lock className="w-6 h-6 text-[#59D8C3]" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#59D8C3]/10 text-[#59D8C3] border border-[#59D8C3]/25">
              ورود
            </span>
          </div>
          <h3 className="text-sm font-bold text-white mb-1.5">ورود به ورک‌اسپیس</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            صفحه ورود مدیران و اعضای مجاز شرکت
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-[#59D8C3] group-hover:gap-2.5 transition-all">
            <span>مشاهده</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </Link>

        {/* کارت سوم - ورک‌اسپیس ادمین */}
        <Link
          href="/dashboard"
          className="group bg-[#0D1B17]/90 backdrop-blur-sm border border-[#59D8C3]/20 rounded-2xl p-6 text-right hover:border-[#59D8C3]/40 hover:shadow-[0_0_40px_rgba(89,216,195,0.1)] transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#59D8C3]/10 border border-[#59D8C3]/20 flex items-center justify-center group-hover:bg-[#59D8C3]/15 transition-colors">
              <LayoutDashboard className="w-6 h-6 text-[#59D8C3]" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F2B84B]/10 text-[#F2B84B] border border-[#F2B84B]/25">
              ادمین
            </span>
          </div>
          <h3 className="text-sm font-bold text-white mb-1.5">ورک‌اسپیس ادمین</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            پنل مدیریت کامل — داشبورد، تیکت‌ها، اعضا و گزارش‌ها
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-[#59D8C3] group-hover:gap-2.5 transition-all">
            <span>مشاهده</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </Link>
      </div>

      {/* متن پایانی */}
      <p className="relative text-xs text-gray-500/60">پروتوتایپ تعاملی — داده‌های نمایشی</p>
    </div>
  );
}