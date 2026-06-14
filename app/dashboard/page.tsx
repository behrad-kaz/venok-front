"use client";

import { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DepartmentDashboard from "@/components/dashboard/DepartmentDashboard";
import EmployeeDashboard from "@/components/dashboard/EmployeeDashboard";
import { useRoleStore } from "@/stores/useRoleStore";

// کامپوننت‌های جدید برای مدیر کل
import StatsCards from "@/components/dashboard/admin/StatsCards";
import AttentionNeeded from "@/components/dashboard/admin/AttentionNeeded";
import ConversationTrend from "@/components/dashboard/admin/ConversationTrend";
import WorkspaceStatus from "@/components/dashboard/admin/WorkspaceStatus";
import DepartmentsTable from "@/components/dashboard/admin/DepartmentsTable";
import RecentConversations from "@/components/dashboard/admin/RecentConversations";

type UserRole = "مدیر کل" | "مدیر" | "کارمند";

// تابع subscribe برای localStorage
const subscribeToLocalStorage = (callback: () => void) => {
  window.addEventListener('storage', callback);
  window.addEventListener('roleChanged', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('roleChanged', callback);
  };
};

const getSavedRole = (): UserRole | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem("userRole") as UserRole | null;
};

export default function DashboardPage() {
  const { role, setRole } = useRoleStore();
  const router = useRouter();
  const [dateRange, setDateRange] = useState("today");
  
  // استفاده از useSyncExternalStore برای همگام‌سازی خودکار با localStorage
  const savedRole = useSyncExternalStore(subscribeToLocalStorage, getSavedRole, () => null);
  
  // همگام‌سازی نقش ذخیره شده با store
  useEffect(() => {
    if (savedRole && savedRole !== role) {
      setRole(savedRole);
    }
  }, [savedRole, role, setRole]);

  const statsData = {
    openConversations: 24,
    waitingForResponse: 8,
    avgResponseTime: "۱۲ دقیقه",
    solvedToday: 15,
  };

  // اگر کارمند است، به صفحه گفتگوهای من ریدایرکت شود
  useEffect(() => {
    if (role === "کارمند") {
      router.push("/dashboard/my-conversations");
    }
  }, [role, router]);

  // نمایش داشبورد مخصوص مدیر دپارتمان
  if (role === "مدیر") {
    return (
      <DashboardLayout>
        <DepartmentDashboard />
      </DashboardLayout>
    );
  }

  // برای کارمند، ریدایرکت انجام می‌شود (در useEffect)
  if (role === "کارمند") {
    return null;
  }

  // نمایش داشبورد مدیر کل
  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">داشبورد</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              نمای کلی وضعیت گفتگوها، دپارتمان‌ها و عملکرد تیم
            </p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm bg-[#0D1B17] border border-[#59D8C3]/20 text-white focus:outline-none focus:border-[#59D8C3] transition-colors cursor-pointer"
          >
            <option value="today">امروز</option>
            <option value="7days">۷ روز اخیر</option>
            <option value="30days">۳۰ روز اخیر</option>
          </select>
        </div>

        <StatsCards data={statsData} />
        <AttentionNeeded />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ConversationTrend />
          <WorkspaceStatus />
        </div>
        <DepartmentsTable />
        <RecentConversations />
      </div>
    </DashboardLayout>
  );
}