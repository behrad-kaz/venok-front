"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  AlertTriangle,
  Info,
  AlertCircle,
} from "lucide-react";
import { useRoleStore, UserRole } from "@/stores/useRoleStore";
import { authService } from "@/services/auth.service";
import { api } from "@/services/api-client";
import { useNotifications } from "@/hooks/useNotifications";
import Link from "next/link";

interface HeaderProps {
  onMenuClick?: () => void;
  isMobileMenuOpen?: boolean;
}

interface UserFullInfo {
  name: string;
  role: string;
  roleDisplay: string;
  departmentName: string;
  avatar: string;
}

const getPageTitle = (pathname: string): string => {
  if (pathname === "/dashboard/workspace-settings") return "تنظیمات Workspace";
  if (pathname === "/dashboard/widget") return "ویجت سایت";
  if (pathname === "/dashboard/my-conversations") return "گفتگوهای من";
  if (pathname === "/dashboard") return "داشبورد";
  if (pathname === "/dashboard/requests") return "درخواست‌ها";
  if (pathname === "/dashboard/conversations") return "گفتگوها";
  if (pathname === "/dashboard/departments") return "دپارتمان‌ها";
  if (pathname === "/dashboard/members") return "اعضا";
  if (pathname === "/dashboard/reports") return "گزارش‌ها";
  if (pathname === "/dashboard/settings") return "تنظیمات";
  return "داشبورد";
};

const roleDisplayMap: Record<string, string> = {
  admin: "مدیر کل",
  moderator: "مدیر",
  user: "کارمند",
};

const getRolePersian = (role: string): string => {
  return roleDisplayMap[role] || role;
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-[#F2B84B]" />;
    case 'danger':
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    default:
      return <Info className="w-4 h-4 text-[#59D8C3]" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'warning':
      return 'bg-[#F2B84B]';
    case 'danger':
      return 'bg-red-400';
    default:
      return 'bg-[#59D8C3]';
  }
};

export default function Header({ onMenuClick, isMobileMenuOpen }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { role: selectedRole, setRole: setSelectedRole } = useRoleStore();
  const { notifications, unreadCount, totalCount, markAsRead, markAllAsRead } = useNotifications();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const [isClient, setIsClient] = useState(false);
  const [userInfo, setUserInfo] = useState<UserFullInfo>({
    name: "...",
    role: "کاربر",
    roleDisplay: "کاربر",
    departmentName: "",
    avatar: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // ✅ دریافت اطلاعات کامل کاربر از API
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        
        const userName = localStorage.getItem("userName") || "کاربر";
        const userRole = localStorage.getItem("userRole") as UserRole || "کارمند";
        const staffId = authService.getStaffId();
        const staffRole = authService.getStaffRole();
        const staffName = authService.getStaffName();

        let departmentName = "";
        let displayRole = userRole;

        if (staffId) {
          try {
            const staffResponse = await api.get<{
              id: number;
              name: string;
              role: string;
              departmentId: number | null;
              department?: { id: number; name: string; color: string };
            }>(`/staff/${staffId}`);

            if (staffResponse.department?.name) {
              departmentName = staffResponse.department.name;
            }

            const roleEnglish = staffResponse.role || staffRole || 'staff';
            
            if (roleEnglish === 'department_manager') {
              displayRole = `مدیر ${departmentName || 'دپارتمان'}`;
            } else if (roleEnglish === 'admin') {
              displayRole = 'مدیر کل';
            } else if (roleEnglish === 'staff') {
              displayRole = `کارمند ${departmentName || ''}`.trim() || 'کارمند';
            } else {
              displayRole = getRolePersian(roleEnglish);
            }

            const finalName = staffResponse.name || staffName || userName;

            setUserInfo({
              name: finalName,
              role: roleEnglish,
              roleDisplay: displayRole,
              departmentName: departmentName,
              avatar: `https://ui-avatars.com/api/?background=59D8C3&color=06110F&name=${encodeURIComponent(finalName)}&length=2&font-size=0.24&size=40`,
            });

          } catch (staffError) {
            console.error('❌ خطا در دریافت اطلاعات staff:', staffError);
            setUserInfo({
              name: userName,
              role: userRole,
              roleDisplay: userRole,
              departmentName: "",
              avatar: `https://ui-avatars.com/api/?background=59D8C3&color=06110F&name=${encodeURIComponent(userName)}&length=2&font-size=0.24&size=40`,
            });
          }
        } else {
          setUserInfo({
            name: userName,
            role: userRole,
            roleDisplay: userRole,
            departmentName: "",
            avatar: `https://ui-avatars.com/api/?background=59D8C3&color=06110F&name=${encodeURIComponent(userName)}&length=2&font-size=0.24&size=40`,
          });
        }

        const savedRole = localStorage.getItem("userRole") as UserRole | null;
        if (savedRole && savedRole !== selectedRole) {
          setSelectedRole(savedRole);
        }

      } catch (error) {
        console.error('❌ خطا در بارگذاری اطلاعات کاربر:', error);
        const userName = localStorage.getItem("userName") || "کاربر";
        const userRole = localStorage.getItem("userRole") as UserRole || "کارمند";
        setUserInfo({
          name: userName,
          role: userRole,
          roleDisplay: userRole,
          departmentName: "",
          avatar: `https://ui-avatars.com/api/?background=59D8C3&color=06110F&name=${encodeURIComponent(userName)}&length=2&font-size=0.24&size=40`,
        });
      } finally {
        setIsLoading(false);
        setIsClient(true);
      }
    };

    fetchUserInfo();
  }, [selectedRole, setSelectedRole]);

  useEffect(() => {
    const handleRoleChange = () => {
      const userName = localStorage.getItem("userName") || "کاربر";
      const userRole = localStorage.getItem("userRole") as UserRole || "کارمند";
      const staffId = authService.getStaffId();
      
      if (staffId) {
        const fetchStaffAgain = async () => {
          try {
            const staffResponse = await api.get<{
              id: number;
              name: string;
              role: string;
              departmentId: number | null;
              department?: { id: number; name: string; color: string };
            }>(`/staff/${staffId}`);
            
            const departmentName = staffResponse.department?.name || "";
            const roleEnglish = staffResponse.role || 'staff';
            let displayRole = getRolePersian(roleEnglish);
            
            if (roleEnglish === 'department_manager') {
              displayRole = `مدیر ${departmentName || 'دپارتمان'}`;
            } else if (roleEnglish === 'staff') {
              displayRole = `کارمند ${departmentName || ''}`.trim() || 'کارمند';
            }
            
            setUserInfo(prev => ({
              ...prev,
              name: staffResponse.name || prev.name,
              role: roleEnglish,
              roleDisplay: displayRole,
              departmentName: departmentName,
              avatar: `https://ui-avatars.com/api/?background=59D8C3&color=06110F&name=${encodeURIComponent(staffResponse.name || prev.name)}&length=2&font-size=0.24&size=40`,
            }));
          } catch (error) {
            console.error('❌ خطا در به‌روزرسانی اطلاعات:', error);
          }
        };
        fetchStaffAgain();
      }
    };

    window.addEventListener('roleChanged', handleRoleChange);
    window.addEventListener('authChange', handleRoleChange);
    window.addEventListener('storage', handleRoleChange);

    return () => {
      window.removeEventListener('roleChanged', handleRoleChange);
      window.removeEventListener('authChange', handleRoleChange);
      window.removeEventListener('storage', handleRoleChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("hasSeenOnboarding");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("staffId");
    localStorage.removeItem("staffRole");
    localStorage.removeItem("staffName");

    document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('authChange'));
    }
    router.push("/login");
  };

  const handleDashboard = () => router.push("/dashboard");
  const handleProfile = () => router.push("/dashboard/profile");

  const pageTitle = getPageTitle(pathname);
  const isDashboardPage = pathname?.startsWith("/dashboard");

  if (!isDashboardPage) return null;

  if (isLoading || !isClient) {
    return (
      <header className="bg-[#0D1B17] border-b border-[#59D8C3]/20 sticky top-0 z-40 backdrop-blur-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold text-white whitespace-nowrap">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.05)] animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-[#0D1B17] border-b border-[#59D8C3]/20 sticky top-0 z-40 backdrop-blur-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onMenuClick} className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#12251F] transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-white whitespace-nowrap">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* ✅ بخش نوتیفیکیشن با داده‌های داینامیک */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative transition-colors rounded-lg p-2 hover:bg-[rgba(255,255,255,0.05)]"
              >
                <Bell className="w-5 h-5 text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F2B84B] text-[0.65rem] text-black text-center rounded-full animate-pulse flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 top-12 w-80 max-h-[500px] overflow-y-auto bg-[#11241fd3] border border-[#59D8C3]/20 rounded-2xl shadow-2xl z-50"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-white">اعلان‌ها</p>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-[#59D8C3] hover:text-[#6ef3dc] transition-colors"
                          >
                            همه را خوانده شد
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-sm text-gray-500">هیچ اعلانی وجود ندارد</p>
                          <p className="text-xs text-gray-600 mt-1">همه چیز خوب است! 🎉</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {notifications.slice(0, 10).map((notification) => (
                            <div
                              key={notification.id}
                              className={`flex gap-3 py-2.5 border-b border-[#59D8C3]/10 last:border-0 ${
                                !notification.isRead ? 'bg-[rgba(89,216,195,0.05)] rounded-lg px-2' : ''
                              }`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div
                                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getNotificationColor(notification.type)}`}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {getNotificationIcon(notification.type)}
                                  <p className="text-xs text-white font-medium truncate">
                                    {notification.title}
                                  </p>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                                  {notification.description}
                                </p>
                                <Link
                                  href={notification.buttonLink}
                                  className="text-[10px] text-[#59D8C3] hover:text-[#6ef3dc] transition-colors mt-1 inline-block"
                                  onClick={() => {
                                    markAsRead(notification.id);
                                    setIsNotificationOpen(false);
                                  }}
                                >
                                  {notification.buttonText} ←
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {notifications.length > 10 && (
                        <div className="text-center mt-3 pt-2 border-t border-[rgba(255,255,255,0.05)]">
                          <Link
                            href="/dashboard/notifications"
                            className="text-xs text-gray-500 hover:text-white transition-colors"
                          >
                            مشاهده همه {totalCount} اعلان
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* بخش پروفایل */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 hover:bg-[#1A352B] transition-colors rounded-lg px-3 py-2"
              >
                <img src={userInfo.avatar} alt={userInfo.name} className="w-8 h-8 rounded-full object-cover border-2 border-[#59D8C3]" />
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white truncate max-w-[120px]">
                    {userInfo.name}
                  </p>
                  <p className="text-xs text-[#59D8C3] truncate max-w-[120px]">
                    {userInfo.roleDisplay}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isProfileMenuOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-[#0D1B17] border border-[#59D8C3]/20 rounded-lg overflow-hidden shadow-xl z-50"
                  >
                    <div className="px-4 py-3 border-b border-[#59D8C3]/10">
                      <div className="flex items-center gap-3">
                        <img src={userInfo.avatar} alt={userInfo.name} className="w-10 h-10 rounded-full object-cover border-2 border-[#59D8C3]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{userInfo.name}</p>
                          <p className="text-xs text-[#59D8C3] truncate">{userInfo.roleDisplay}</p>
                          {userInfo.departmentName && (
                            <p className="text-[10px] text-gray-500 truncate mt-0.5">
                              دپارتمان: {userInfo.departmentName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <button onClick={handleDashboard} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#12251F] hover:text-white transition-colors">
                      <LayoutDashboard className="w-4 h-4" /><span>داشبورد</span>
                    </button>
                    <button onClick={handleProfile} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#12251F] hover:text-white transition-colors">
                      <UserCircle className="w-4 h-4" /><span>پروفایل من</span>
                    </button>
                    <button onClick={handleProfile} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#12251F] hover:text-white transition-colors">
                      <Settings className="w-4 h-4" /><span>تنظیمات</span>
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#FF6B6B] hover:bg-[#12251F] transition-colors">
                      <LogOut className="w-4 h-4" /><span>خروج از حساب</span>
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