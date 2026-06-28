"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  ChevronRight,
  Headphones,
  X,
  Code,
  Shield,
  Menu,
} from "lucide-react";
import Header from "../layout/Header";
import { useRoleStore } from "@/stores/useRoleStore";
import { api } from "@/services/api-client";

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
  { id: "dashboard", title: "داشبورد", icon: LayoutDashboard, href: "/dashboard", badge: 5 },
  { id: "conversations", title: "گفتگوها", icon: MessageCircle, href: "/dashboard/conversations", badge: 5 },
  { id: "departments", title: "دپارتمان‌ها", icon: Building2, href: "/dashboard/departments" },
  { id: "members", title: "اعضا", icon: Users, href: "/dashboard/members" },
  { id: "reports", title: "گزارشات", icon: FileText, href: "/dashboard/reports" },
  { id: "widget", title: "ویجت سایت", icon: Code, href: "/dashboard/widget" },
  { id: "workspace", title: "تنظیمات Workspace", icon: Settings, href: "/dashboard/workspace-settings" },
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

// کامپوننت SidebarContent به صورت جداگانه و خارج از کامپوننت اصلی
interface SidebarContentProps {
  isSidebarCollapsed: boolean;
  menuItems: MenuItem[];
  pathname: string;
  companyName: string;
  companyLogo: string | null;
  companyDescription: string;
  toggleSidebar: () => void;
  onMenuItemClick: () => void;
}

function SidebarContent({
  isSidebarCollapsed,
  menuItems,
  pathname,
  companyName,
  companyLogo,
  companyDescription,
  toggleSidebar,
  onMenuItemClick,
}: SidebarContentProps) {
  return (
    <>
      {/* لوگو و نام شرکت - در حالت کوچک فقط لوگو */}
      <div className="p-5 border-b border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[rgba(89,216,195,0.15)] border border-[rgba(89,216,195,0.3)] flex items-center justify-center flex-shrink-0 overflow-hidden">
            {companyLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={companyLogo} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <Headphones className="w-5 h-5 text-[#59D8C3]" />
            )}
          </div>
          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-white truncate">{companyName}</h2>
              <p className="text-xs text-gray-500 truncate">{companyDescription}</p>
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
                onClick={onMenuItemClick}
                className={`flex items-center justify-center gap-3 px-3 py-3 rounded-3xl text-sm font-medium transition-all relative group ${
                  isActive
                    ? "bg-[rgba(89,216,195,0.12)] text-[#59D8C3] border border-[rgba(89,216,195,0.2)] shadow-[0_0_20px_rgba(89,216,195,0.15)]"
                    : "text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.04)] border border-transparent hover:border-[rgba(255,255,255,0.1)]"
                }`}
              >
                <Icon className="w-5 h-6 flex-shrink-0" />
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

      {/* فوتر سایدبار با دکمه Collapse/Expand */}
      <div className="flex justify-between p-3 border-t border-[rgba(255,255,255,0.1)]">
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl">
            <Shield className="w-3 h-3 text-gray-600" />
            <span className="text-[10px] text-gray-600">نسخه ۱.۰.۰</span>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center gap-2 p-1 rounded-full text-sm font-medium transition-all text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.04)] border border-transparent hover:border-[rgba(255,255,255,0.1)] group"
        >
          {isSidebarCollapsed ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </>
  );
}

// ✅ تابع دریافت workspace اطلاعات از API با استفاده از apiClient
const fetchWorkspaceName = async (): Promise<string | null> => {
  try {
    const workspaceId = localStorage.getItem("currentWorkspaceId");
    if (!workspaceId) {
      console.warn('⚠️ workspaceId یافت نشد');
      return null;
    }

    // ✅ استفاده از apiClient به جای fetch مستقیم
    const data = await api.get<{ name: string }>(`/workspace/${workspaceId}`);
    console.log('📡 workspace دریافت شد:', data);
    return data?.name || null;
  } catch (error) {
    console.error('❌ خطا در دریافت workspace:', error);
    return null;
  }
};

// ✅ تابع دریافت لوگو با استفاده از apiClient
const fetchOrganizationLogo = async (): Promise<string | null> => {
  try {
    // ✅ استفاده از apiClient به جای fetch مستقیم
    const data = await api.get<{ logo: string | null }>('/organization/current');
    console.log('📡 organization دریافت شد:', data);
    return data?.logo || null;
  } catch (error) {
    console.error('❌ خطا در دریافت لوگو:', error);
    return null;
  }
};

// کامپوننت اصلی
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { role } = useRoleStore();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMounted = useRef(true);
  
  const [companyName, setCompanyName] = useState("آژانس سفر نمونه");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyDescription, setCompanyDescription] = useState("پنل پشتیبانی مشتریان");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // ✅ بارگذاری اطلاعات از localStorage و API در کلاینت
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. خواندن از localStorage
        const savedCollapsed = localStorage.getItem("sidebarCollapsed");
        if (savedCollapsed !== null) {
          setIsSidebarCollapsed(savedCollapsed === "true");
        }
        
        const savedName = localStorage.getItem("companyName");
        const savedLogo = localStorage.getItem("companyLogo");
        const savedDesc = localStorage.getItem("companyDescription");
        
        // 2. نام شرکت
        if (savedName) {
          setCompanyName(savedName);
        } else {
          const workspaceName = await fetchWorkspaceName();
          if (workspaceName) {
            setCompanyName(workspaceName);
            localStorage.setItem("companyName", workspaceName);
          }
        }
        
        // 3. ✅ لوگو - همیشه از API بگیر (چون URL ممکنه منقضی شده باشه)
        console.log('🔄 دریافت لوگو از API...');
        const logo = await fetchOrganizationLogo();
        if (logo) {
          console.log('✅ لوگو از API دریافت شد');
          setCompanyLogo(logo);
          localStorage.setItem("companyLogo", logo);
        } else if (savedLogo) {
          // اگر API لوگو نداد، از localStorage استفاده کن
          console.log('⚠️ لوگو از API دریافت نشد، استفاده از cached version');
          setCompanyLogo(savedLogo);
        }
        
        if (savedDesc) {
          setCompanyDescription(savedDesc);
        }
      } catch (error) {
        console.error('❌ خطا در بارگذاری داده‌ها:', error);
      } finally {
        setIsDataLoaded(true);
      }
    };

    loadData();
  }, []);

  // گوش دادن به تغییرات localStorage برای به‌روزرسانی خودکار
  useEffect(() => {
    isMounted.current = true;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "companyName" && event.newValue !== null) {
        setCompanyName(event.newValue);
      }
      if (event.key === "companyLogo" && event.newValue !== null) {
        setCompanyLogo(event.newValue);
      }
      if (event.key === "companyDescription" && event.newValue !== null) {
        setCompanyDescription(event.newValue);
      }
      if (event.key === "sidebarCollapsed" && event.newValue !== null) {
        setIsSidebarCollapsed(event.newValue === "true");
      }
    };

    const handleCompanyUpdate = () => {
      const newName = localStorage.getItem("companyName");
      const newLogo = localStorage.getItem("companyLogo");
      const newDesc = localStorage.getItem("companyDescription");
      
      if (newName) setCompanyName(newName);
      if (newLogo) setCompanyLogo(newLogo);
      if (newDesc) setCompanyDescription(newDesc);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('companyUpdated', handleCompanyUpdate);

    return () => {
      isMounted.current = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('companyUpdated', handleCompanyUpdate);
    };
  }, []);

  const toggleSidebar = useCallback(() => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  }, [isSidebarCollapsed]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMounted.current) {
        setIsMobileMenuOpen(false);
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [pathname]);

  const getMenuItems = useCallback((): MenuItem[] => {
    if (role === "مدیر کل") return adminMenuItems;
    if (role === "مدیر") return managerMenuItems;
    return staffMenuItems;
  }, [role]);

  const menuItems = useMemo(() => getMenuItems(), [getMenuItems]);

  const getUserInfo = useCallback(() => {
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
  }, [role]);

  const userInfo = useMemo(() => getUserInfo(), [getUserInfo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#062723] to-[#020504]">
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? "80px" : "280px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed right-0 top-0 h-screen z-50 bg-[rgba(9,22,18,0.98)] backdrop-blur-xl border-l border-[rgba(255,255,255,0.1)] hidden md:flex flex-col shadow-2xl"
      >
        <SidebarContent
          isSidebarCollapsed={isSidebarCollapsed}
          menuItems={menuItems}
          pathname={pathname}
          companyName={companyName}
          companyLogo={companyLogo}
          companyDescription={companyDescription}
          toggleSidebar={toggleSidebar}
          onMenuItemClick={closeMobileMenu}
        />
      </motion.aside>

      <div 
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? "md:mr-[80px]" : "md:mr-[280px]"
        }`}
      >
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} isMobileMenuOpen={isMobileMenuOpen} />
        <main className="overflow-auto min-h-screen">
          <div className="p-6">{children}</div>
        </main>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] lg:hidden"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 w-72 h-full z-[101] bg-[rgba(9,22,18,0.98)] backdrop-blur-xl border-l border-[rgba(255,255,255,0.1)] flex flex-col shadow-2xl lg:hidden"
            >
              <div className="p-3 border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgba(89,216,195,0.15)] border border-[rgba(89,216,195,0.3)] flex items-center justify-center overflow-hidden">
                    {companyLogo ? (
                      <img src={companyLogo} alt="logo" className="w-full h-full object-cover" />
                    ) : (
                      <Headphones className="w-5 h-5 text-[#59D8C3]" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">{companyName}</h2>
                    <p className="text-xs text-gray-500">{companyDescription}</p>
                  </div>
                </div>
                <button
                  onClick={closeMobileMenu}
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
                      onClick={closeMobileMenu}
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