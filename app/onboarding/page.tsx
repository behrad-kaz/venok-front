// app/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  MessageCircle,
  Users,
  BarChart3,
  CheckCircle,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // شبیه‌سازی درخواست به سرور
    setTimeout(() => {
      // بررسی اعتبار (admin/admin123 برای مدیر کل)
      if (username === "admin" && password === "admin123") {
        // ذخیره کردن که مدیر کل onboarding را دیده است
        localStorage.setItem("hasSeenOnboarding", "true");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "مدیر کل");
        localStorage.setItem("userRoleEnglish", "super_admin");

        // تنظیم کوکی برای middleware با مقدار انگلیسی
        document.cookie = `isLoggedIn=true; path=/; max-age=${60 * 60 * 24 * 7}`;
        document.cookie = `userRole=super_admin; path=/; max-age=${60 * 60 * 24 * 7}`;
        document.cookie = `hasSeenOnboarding=true; path=/; max-age=${60 * 60 * 24 * 7}`;

        // ریدایرکت به صفحه موفقیت
        router.push("/onboarding/success");
      } else {
        setError("نام کاربری یا رمز عبور اشتباه است");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    
    <main className="flex-1 overflow-y-auto  rtl-scrollbar p-6">
              <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#59d8c3] to-transparent" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#59d8c3] rounded-full blur-[150px]" />
        </div>

      <div
        className="min-h-screen  relative overflow-hidden"
        dir="rtl"
      >
        {/* پس‌زمینه با جلوه‌های بصری */}

        <div className="relative z-10 min-h-screen flex">
          {/* بخش چپ - توضیحات */}
          <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 items-center justify-center p-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md"
            >
              <div className="mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] flex items-center justify-center mb-6">
                  <MessageCircle className="w-8 h-8 text-[#06110F]" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                  سیستم مدیریت گفتگو
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                  مدیریت گفتگوهای مشتریان در یک فضای متمرکز
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(89,216,195,0.1)] border border-[rgba(89,216,195,0.2)] flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-[#59d8c3]" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm font-medium">
                      مدیریت چند دپارتمانی
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      سازماندهی هوشمند تیم‌ها
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(89,216,195,0.1)] border border-[rgba(89,216,195,0.2)] flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-[#59d8c3]" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm font-medium">
                      تخصیص هوشمند گفتگو
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      ارسال خودکار به کارشناس مربوطه
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(89,216,195,0.1)] border border-[rgba(89,216,195,0.2)] flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-[#59d8c3]" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm font-medium">
                      گزارش‌گیری دقیق
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      تحلیل عملکرد و رضایت مشتری
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* بخش راست - فرم ورود */}
          <div className="flex-1 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-md"
            >
              <div className="p-8 rounded-3xl bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] shadow-2xl">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    ورود به پنل پشتیبانی
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    برای مدیریت گفتگوها وارد حساب کاربری خود شوید.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* نام کاربری */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      نام کاربری یا شماره همراه
                      <span className="text-[#59D8C3] mr-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin یا 09121234567"
                      dir="rtl"
                      className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#59D8C3] transition-all bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
                      required
                    />
                  </div>

                  {/* رمز عبور */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      رمز عبور
                      <span className="text-[#59D8C3] mr-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="رمز عبور خود را وارد کنید"
                        className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#59D8C3] transition-all bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* گزینه‌های اضافی */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)] text-[#59D8C3] focus:ring-2 focus:ring-[#59D8C3]"
                      />
                      <span className="text-sm text-gray-400">
                        مرا به خاطر بسپار
                      </span>
                    </label>
                    <button
                      type="button"
                      className="text-sm text-[#59D8C3] hover:text-[#4dc7b5] transition-colors"
                    >
                      فراموشی رمز عبور؟
                    </button>
                  </div>

                  {/* خطا */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-center"
                    >
                      <p className="text-red-400 text-sm">{error}</p>
                    </motion.div>
                  )}

                  {/* دکمه ورود */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-6 py-3 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:opacity-90 active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-[#06110F] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "ورود "
                    )}
                  </button>

                  {/* حساب‌های دمو */}
                  <div className="pt-4 border-t border-[rgba(255,255,255,0.1)]">
                    <p className="text-xs text-gray-500 mb-2">حساب‌های دمو:</p>
                    <div className="space-y-1 text-xs text-gray-400">
                      <p> Admin: admin / admin123</p>
                      <p> Manager: manager.support / manager123</p>
                      <p> Staff: staff.ali / staff123</p>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
