"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MessageCircle,
  Users,
  Building2,
  FileText,
  Settings,
  ChevronLeft,
  Headphones,
  X,
  Code,
  Shield,
} from "lucide-react";
import Header from "../layout/Header";
import { useRoleStore } from "@/stores/useRoleStore";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
}

// منوی مدیر کل
const adminMenuItems: MenuItem[] = [
  { id: "dashboard", title: "داشبورد", icon: LayoutDashboard, href: "/dashboard" },
  { id: "conversations", title: "گفتگوها", icon: MessageCircle, href: "/dashboard/conversations", badge: 5 },
  { id: "departments", title: "دپارتمان‌ها", icon: Building2, href: "/dashboard/departments" },
  { id: "members", title: "اعضا", icon: Users, href: "/dashboard/members" },
  { id: "reports", title: "گزارشات", icon: FileText, href: "/dashboard/reports" },
  { id: "widget", title: "ویجت سایت", icon: Code, href: "/dashboard/widget" },
  { id: "workspace", title: "تنظیمات Workspace", icon: Settings, href: "/dashboard/settings" },
];

// منوی مدیر دپارتمان
const managerMenuItems: MenuItem[] = [
  { id: "dashboard", title: "داشبورد", icon: LayoutDashboard, href: "/dashboard" },
  { id: "conversations", title: "گفتگوها", icon: MessageCircle, href: "/dashboard/conversations", badge: 3 },
  { id: "members", title: "اعضای دپارتمان", icon: Users, href: "/dashboard/members" },
  { id: "reports", title: "گزارشات دپارتمان", icon: FileText, href: "/dashboard/reports" },
  { id: "settings", title: "تنظیمات دپارتمان", icon: Settings, href: "/dashboard/settings" },
];

// منوی کارمند - فقط گفتگوهای من
const staffMenuItems: MenuItem[] = [
  { id: "my-conversations", title: "گفتگوهای من", icon: MessageCircle, href: "/dashboard/my-conversations", badge: 2 },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { role } = useRoleStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getMenuItems = (): MenuItem[] => {
    if (role === "مدیر کل") return adminMenuItems;
    if (role === "مدیر") return managerMenuItems;
    return staffMenuItems;
  };

  const menuItems = getMenuItems();

  // اطلاعات کاربر بر اساس نقش
  const getUserInfo = () => {
    if (role === "مدیر کل") {
      return {
        name: "امیر حسینی",
        role: "مدیر کل",
        avatar: `https://ui-avatars.com/api/?background=59D8C3&color=06110F&name=امیر&length=2&font-size=0.24&size=40`,
      };
    }
    if (role === "مدیر") {
      return {
        name: "سارا محمدی",
        role: "مدیر",
        avatar: `https://ui-avatars.com/api/?background=59D8C3&color=06110F&name=سارا&length=2&font-size=0.24&size=40`,
      };
    }
    return {
      name: "علی احمدی",
      role: "کارمند",
      avatar: `https://ui-avatars.com/api/?background=59D8C3&color=06110F&name=علی&length=2&font-size=0.24&size=40`,
    };
  };

  const userInfo = getUserInfo();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <>
      {/* لوگو و نام شرکت */}
      <div className="p-5 border-b border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(89,216,195,0.15)] border border-[rgba(89,216,195,0.3)] flex items-center justify-center flex-shrink-0">
            <Headphones className="w-5 h-5 text-[#59D8C3]" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-white truncate">آژانس سفر نمونه</h2>
              <p className="text-xs text-gray-500 truncate">پنل پشتیبانی مشتریان</p>
            </div>
          )}
        </div>
      </div>

      {/* منوی اصلی */}
      <nav className="flex-1 overflow-y-auto rtl-scrollbar p-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group ${
                  isActive
                    ? "bg-[rgba(89,216,195,0.12)] text-[#59D8C3] border border-[rgba(89,216,195,0.2)] shadow-[0_0_20px_rgba(89,216,195,0.15)]"
                    : "text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.04)] border border-transparent hover:border-[rgba(255,255,255,0.1)]"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <>
                    <span className="flex-1 text-right truncate">{item.title}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F2B84B] text-[#1c1302]">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* فوتر سایدبار */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl">
          <Shield className="w-3 h-3 text-gray-600" />
          {!isSidebarCollapsed && (
            <span className="text-[10px] text-gray-600">نسخه ۱.۰.۰</span>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#062723] to-[#020504]">
      {/* سایدبار دسکتاپ */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? "80px" : "280px" }}
        transition={{ duration: 0.3 }}
        className="fixed right-0 top-0 h-screen z-50 bg-[rgba(9,22,18,0.98)] backdrop-blur-xl border-l border-[rgba(255,255,255,0.1)] hidden md:flex flex-col shadow-2xl"
      >
        <SidebarContent />
      </motion.aside>

      {/* محتوای اصلی */}
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? "md:mr-[80px]" : "md:mr-[280px]"}`}>
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} isMobileMenuOpen={isMobileMenuOpen} />
        <main className="overflow-auto min-h-screen">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* سایدبار موبایل */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] lg:hidden"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 w-72 h-full z-[101] bg-[rgba(9,22,18,0.98)] backdrop-blur-xl border-l border-[rgba(255,255,255,0.1)] flex flex-col shadow-2xl lg:hidden"
            >
              {/* هدر موبایل */}
              <div className="p-4 border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(89,216,195,0.15)] border border-[rgba(89,216,195,0.3)] flex items-center justify-center">
                    <Headphones className="w-5 h-5 text-[#59D8C3]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">آژانس سفر نمونه</h2>
                    <p className="text-xs text-gray-500">پنل پشتیبانی مشتریان</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* منوی موبایل */}
              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-[rgba(89,216,195,0.12)] text-[#59D8C3] border border-[rgba(89,216,195,0.2)]"
                          : "text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.04)]"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-right truncate">{item.title}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F2B84B] text-[#1c1302]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* پروفایل موبایل */}
              <div className="p-4 border-t border-[rgba(255,255,255,0.1)]">
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
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}