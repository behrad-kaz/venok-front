// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, User, Lock, Sparkles, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      if (username === "admin" && password === "123456") {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "مدیر کل");
        router.push("/dashboard");
      } else {
        setError("نام کاربری یا رمز عبور اشتباه است");
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#193631] to-[#000000] relative overflow-hidden">
      {/* دایره‌های محو */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#2a413d5e] rounded-full blur-3xl" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#2849445e] rounded-full blur-3xl" />

      {/* دکمه بازگشت */}
      <div className="absolute top-6 right-6 z-50 text-gray-400 text-xs hover:text-white transition-colors">
        <Link
          href="/"
          className="flex items-center gap-2 border rounded-2xl p-1 border-[#12565354]"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>بازگشت</span>
        </Link>
      </div>

      {/* فرم ورود */}
      <div className="relative z-10 -mt-20 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* لوگو و عنوان */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#06110F]" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">پشتیبان‌یار</h1>
            <p className="text-gray-400 text-sm">پلتفرم مدیریت پشتیبانی مشتریان</p>
          </div>

          <div className="bg-[#0D1B17]/90 backdrop-blur-sm border border-[#59D8C3]/20 rounded-2xl p-8 shadow-2xl">
            <div className="mb-4">
              <h2 className="font-bold">ورود به ورک اسپیس</h2>
              <span className="text-sm text-gray-300">آژانس سفر نمونه</span>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* نام کاربری */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">نام کاربری</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="نام کاربری خود را وارد کنید"
                    className="w-full bg-[#12251F] text-sm border border-[#59D8C3]/20 rounded-3xl py-3 pr-12 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                    required
                  />
                </div>
              </div>

              {/* رمز عبور */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">رمز عبور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/3 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="رمز عبور خود را وارد کنید"
                    className="w-full bg-[#12251F] text-sm border border-[#59D8C3]/20 rounded-3xl py-3 pr-12 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                    required
                  />
                  <span className="text-xs text-gray-300">رمز عبور خود را فراموش کردید ؟</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/3 -translate-y-1/2 text-gray-500 hover:text-[#59D8C3] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
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
                className="w-full bg-[#59bfd8] text-[#06110F] font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#59D8C3]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#06110F] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>ورود به ورک‌اسپیس</span>
                )}
              </button>

              {/* اطلاعات دمو */}
              <div className="flex justify-center gap-2 text-center">
                <p className="text-gray-500 text-xs mb-1">نکته:</p>
                <p className="text-[#59D8C3] text-sm font-mono">username: admin / pass: 123456</p>
              </div>
            </form>
          </div>

          {/* متن پایانی */}
          <p className="text-center text-gray-500 text-xs mt-2">
            ورود فقط برای مدیران و اعضای مجاز شرکت‌ها امکان‌پذیر است.
          </p>
        </motion.div>
      </div>
    </div>
  );
}