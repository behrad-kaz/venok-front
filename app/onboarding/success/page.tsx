// app/onboarding/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

useEffect(() => {
  const timer = setInterval(() => {
    setCountdown((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        router.push("/onboarding/workspace"); 
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  return () => clearInterval(timer);
}, [router]);

  const handleBackToLogin = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("hasSeenOnboarding");
    document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = "hasSeenOnboarding=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/login");
  };

  return (
    <main className="flex-1 overflow-y-auto rtl-scrollbar p-6">
      <div className="min-h-screen bg-gradient-to-br from-[#0a3d35] to-[#050f0d] flex items-center justify-center p-6" dir="rtl">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] shadow-2xl text-center">
          
          {/* آیکون تیک موفقیت */}
          <div className="w-20 h-20 rounded-full bg-[rgba(89,216,195,0.1)] border border-[rgba(89,216,195,0.2)] flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#59d8c3" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* عنوان */}
          <h2 className="text-2xl font-bold text-white mb-2">ورود موفق بود</h2>
          
          {/* توضیحات */}
          <p className="text-gray-400 mb-6">در حال انتقال به پنل...</p>
          
          {/* اسپینر و متن هدایت */}
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="12" cy="12" r="10" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
            </svg>
            <span className="text-sm text-gray-400">هدایت به داشبورد ({countdown})</span>
          </div>
          
          {/* دکمه بازگشت به ورود */}
          <button 
            onClick={handleBackToLogin}
            className="mt-8 text-sm text-primary hover:text-[#4dc7b5] transition-colors"
          >
            بازگشت به ورود
          </button>
          
        </div>
      </div>
    </main>
  );
}