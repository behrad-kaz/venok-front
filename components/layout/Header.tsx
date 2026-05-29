// components/layout/Header.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  User,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  UserCircle,
  Settings,
  Menu,
} from "lucide-react";
import { useRoleStore, UserRole } from "@/stores/useRoleStore";

interface UserInfo {
  name: string;
  role: UserRole;
  avatar?: string;
}

interface HeaderProps {
  onMenuClick?: () => void;
  isMobileMenuOpen?: boolean;
}

const getPageTitle = (pathname: string): string => {
  if (pathname === "/dashboard") return "داشبورد";
  if (pathname === "/dashboard/requests") return "درخواست‌ها";
  if (pathname === "/dashboard/conversations") return "گفتگوها";
  if (pathname === "/dashboard/departments") return "دپارتمان‌ها";
  if (pathname === "/dashboard/members") return "اعضا";
  if (pathname === "/dashboard/reports") return "گزارش‌ها";
  if (pathname === "/dashboard/settings") return "تنظیمات";
  return "داشبورد";
};

export default function Header({ onMenuClick, isMobileMenuOpen }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { role: selectedRole, setRole: setSelectedRole } = useRoleStore();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [hasNotification, setHasNotification] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const userInfo: UserInfo = {
    name: selectedRole === "مدیر" ? "سارا محمدی" : "مریم رضایی",
    role: selectedRole,
    avatar: `https://ui-avatars.com/api/?background=59D8C3&color=06110F&name=${selectedRole === "مدیر" ? "سارا" : "مریم"}&length=2&font-size=0.24&size=40`,
  };

  const roles: UserRole[] = ["مدیر کل", "مدیر", "کارمند"];

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setIsRoleMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    setIsLoggedIn(false);
    router.push("/login");
  };

  const handleDashboard = () => {
    router.push("/dashboard");
  };

  const handleProfile = () => {
    router.push("/dashboard/profile");
  };

  const pageTitle = getPageTitle(pathname);
  const isDashboardPage = pathname?.startsWith("/dashboard");

  if (!isDashboardPage) return null;

  return (
    <header className="bg-[#0D1B17] border-b border-[#59D8C3]/20 sticky top-0 z-40 backdrop-blur-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#12251F] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-white whitespace-nowrap">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* انتخاب نقش - دسکتاپ */}
            <div className="hidden md:flex items-center gap-1 bg-[#122520] border border-[#59D8C3]/20 rounded-3xl p-1 px-2">
              <div className="ml-2 text-gray-400">
                <h2>نقش :</h2>
              </div>
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`px-4 py-2 rounded-3xl text-sm font-medium transition-all duration-300 ${
                    selectedRole === role
                      ? "bg-[#59bfd8] text-[#06110F] shadow-md"
                      : "text-gray-400 hover:text-white hover:bg-[#12251F]"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* انتخاب نقش - موبایل */}
            <div className="relative md:hidden">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-2 bg-[#12251F] hover:bg-[#1A352B] transition-colors border border-[#59D8C3]/20 rounded-lg px-4 py-2"
              >
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-[#59D8C3]" />
                  <span className="text-xs text-gray-300">نقش:</span>
                </div>
                <span className="text-xs text-white font-medium">{selectedRole}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                    isRoleMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isRoleMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-40 bg-[#0D1B17] border border-[#59D8C3]/20 rounded-lg overflow-hidden shadow-xl z-50"
                  >
                    {roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => handleRoleChange(role)}
                        className={`w-full text-right px-4 py-2 text-sm transition-colors ${
                          selectedRole === role
                            ? "bg-gradient-to-r from-[#59D8C3]/20 to-[#5BE0A8]/20 text-[#59D8C3]"
                            : "text-gray-300 hover:bg-[#12251F] hover:text-white"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* دکمه نوتیفیکیشن */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  if (hasNotification) setHasNotification(false);
                }}
                className="relative transition-colors rounded-lg p-2"
              >
                <Bell className="w-5 h-5 text-gray-300" />
                {hasNotification && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F2B84B] text-[0.65rem] text-black text-center rounded-full animate-pulse flex items-center justify-center">
                    3
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 top-12 w-80 bg-[#11241fd3] border border-[#59D8C3]/20 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4">
                      <p className="text-sm font-semibold text-white mb-3">اعلان‌ها</p>
                      <div className="space-y-2">
                        <div className="flex gap-3 py-2.5 border-b border-[#59D8C3]/10 last:border-0">
                          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#F2B84B]" />
                          <div>
                            <p className="text-xs text-white">تیکت جدید از رضا احمدی</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">۵ دقیقه پیش</p>
                          </div>
                        </div>
                        <div className="flex gap-3 py-2.5 border-b border-[#59D8C3]/10 last:border-0">
                          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#59D8C3]" />
                          <div>
                            <p className="text-xs text-white">سارا محمدی پیام جدیدی فرستاد</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">۱۲ دقیقه پیش</p>
                          </div>
                        </div>
                        <div className="flex gap-3 py-2.5 border-b border-[#59D8C3]/10 last:border-0">
                          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#5BE0A8]" />
                          <div>
                            <p className="text-xs text-white">تیکت #SUP-1044 بسته شد</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">۱ ساعت پیش</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* دکمه پروفایل */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 hover:bg-[#1A352B] transition-colors rounded-lg px-3 py-2"
              >
                <img
                  src={userInfo.avatar}
                  alt={userInfo.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#59D8C3]"
                />
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{userInfo.name}</p>
                  <p className="text-xs text-[#59D8C3]">{userInfo.role}</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                    isProfileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-[#0D1B17] border border-[#59D8C3]/20 rounded-lg overflow-hidden shadow-xl z-50"
                  >
                    <div className="px-4 py-3 border-b border-[#59D8C3]/10">
                      <div className="flex items-center gap-3">
                        <img
                          src={userInfo.avatar}
                          alt={userInfo.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#59D8C3]"
                        />
                        <div>
                          <p className="text-sm font-medium text-white">{userInfo.name}</p>
                          <p className="text-xs text-[#59D8C3]">{userInfo.role}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleDashboard}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#12251F] hover:text-white transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>داشبورد</span>
                    </button>

                    <button
                      onClick={handleProfile}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#12251F] hover:text-white transition-colors"
                    >
                      <UserCircle className="w-4 h-4" />
                      <span>پروفایل من</span>
                    </button>

                    <button
                      onClick={handleProfile}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#12251F] hover:text-white transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>تنظیمات</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#FF6B6B] hover:bg-[#12251F] transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>خروج از حساب</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}