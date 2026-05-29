// components/dashboard/DashboardLayout.tsx
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
} from "lucide-react";
import Header from "../layout/Header";
import { useRoleStore } from "@/stores/useRoleStore";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// منوی مدیر کل
const adminMenuItems = [
  { id: "dashboard", title: "داشبورد", icon: LayoutDashboard, href: "/dashboard" },
  { id: "requests", title: "درخواست‌ها", icon: FileText, href: "/dashboard/requests" },
  { id: "conversations", title: "گفت‌وگوها", icon: MessageCircle, href: "/dashboard/conversations" },
  { id: "departments", title: "دپارتمان‌ها", icon: Building2, href: "/dashboard/departments" },
  { id: "members", title: "اعضا", icon: Users, href: "/dashboard/members" },
  { id: "reports", title: "گزارش‌ها", icon: FileText, href: "/dashboard/reports" },
  { id: "settings", title: "تنظیمات", icon: Settings, href: "/dashboard/settings" },
];

// منوی مدیر دپارتمان
const managerMenuItems = [
  { id: "dashboard", title: "داشبورد", icon: LayoutDashboard, href: "/dashboard" },
  { id: "requests", title: "درخواست‌ها", icon: FileText, href: "/dashboard/requests" },
  { id: "conversations", title: "گفت‌وگوها", icon: MessageCircle, href: "/dashboard/conversations" },
  { id: "departments", title: "دپارتمان‌ها", icon: Building2, href: "/dashboard/departments" },
  { id: "members", title: "اعضا", icon: Users, href: "/dashboard/members" },
  { id: "reports", title: "گزارش‌ها", icon: FileText, href: "/dashboard/reports" },
];

// منوی کارمند
const staffMenuItems = [
  { id: "dashboard", title: "داشبورد", icon: LayoutDashboard, href: "/dashboard" },
  { id: "requests", title: "درخواست‌ها", icon: FileText, href: "/dashboard/requests" },
  { id: "conversations", title: "گفت‌وگوها", icon: MessageCircle, href: "/dashboard/conversations" },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { role } = useRoleStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getMenuItems = () => {
    if (role === "مدیر کل") return adminMenuItems;
    if (role === "مدیر") return managerMenuItems;
    return staffMenuItems;
  };

  const menuItems = getMenuItems();

  const userInfo = {
    name: role === "مدیر" ? "سارا محمدی" : "دانشور",
    role: role,
    avatar: `https://ui-avatars.com/api/?background=59D8C3&color=06110F&name=${role === "مدیر" ? "سارا" : "دانشور"}&length=2&font-size=0.24&size=40`,
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-[#59D8C3]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5be0e0] rounded-full flex items-center justify-center">
            <Headphones className="w-5 h-5 text-[#06110F]" />
          </div>
          {!isSidebarCollapsed && (
            <div>
              <h2 className="text-white font-bold text-lg">پشتیبان یار</h2>
              <p className="text-gray-400 text-xs">آژانس سفر نمونه</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-3xl transition-all duration-300 group ${
                isActive
                  ? "bg-[#27495246] border border-[#27495246] text-[#59D8C3]"
                  : "text-gray-400 hover:text-white hover:bg-[#12251F]"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isSidebarCollapsed && (
                <span className="text-sm font-medium">{item.title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#59D8C3]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={userInfo.avatar}
              alt={userInfo.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#59D8C3]"
            />
            {!isSidebarCollapsed && (
              <div>
                <p className="text-white text-sm font-medium">{userInfo.name}</p>
                <p className="text-[#59D8C3] text-xs">{userInfo.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-gray-400 hover:text-[#59D8C3] transition-colors hidden md:block"
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform duration-300 ${
                isSidebarCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a3833] to-[#020807]">
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? "80px" : "280px" }}
        transition={{ duration: 0.3 }}
        className="fixed right-0 top-0 h-screen z-50 bg-[#0D1B17]/95 backdrop-blur-md border-l border-[#59D8C3]/20 hidden md:flex flex-col shadow-xl"
      >
        <SidebarContent />
      </motion.aside>

      <div className="md:mr-[280px] transition-all duration-300 relative">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} isMobileMenuOpen={isMobileMenuOpen} />
        <main className="overflow-auto min-h-screen">
          <div className="p-6 pt-0 md:pt-6">{children}</div>
        </main>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] lg:hidden"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 w-72 h-full z-[101] bg-[#0D1B17] border-l border-[#59D8C3]/20 flex flex-col shadow-2xl lg:hidden"
            >
              <div className="p-4 border-b border-[#59D8C3]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#5be0e0] rounded-full flex items-center justify-center">
                    <Headphones className="w-5 h-5 text-[#06110F]" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">پشتیبان یار</h2>
                    <p className="text-gray-400 text-xs">آژانس سفر نمونه</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-3xl transition-all duration-300 ${
                        isActive
                          ? "bg-[#27495246] border border-[#27495246] text-[#59D8C3]"
                          : "text-gray-400 hover:text-white hover:bg-[#12251F]"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-[#59D8C3]/20">
                <div className="flex items-center gap-3">
                  <img
                    src={userInfo.avatar}
                    alt={userInfo.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#59D8C3]"
                  />
                  <div>
                    <p className="text-white text-sm font-medium">{userInfo.name}</p>
                    <p className="text-[#59D8C3] text-xs">{userInfo.role}</p>
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