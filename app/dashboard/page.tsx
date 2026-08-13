"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DepartmentDashboard from "@/components/dashboard/DepartmentDashboard";
import { useRoleStore } from "@/stores/useRoleStore";
import { authService } from "@/services/auth.service";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useConversationTrend } from "@/hooks/useConversationTrend";

// کامپوننت‌های جدید برای مدیر کل
import StatsCards from "@/components/dashboard/admin/StatsCards";
import AttentionNeeded from "@/components/dashboard/admin/AttentionNeeded";
import ConversationTrend from "@/components/dashboard/admin/ConversationTrend";
import WorkspaceStatus from "@/components/dashboard/admin/WorkspaceStatus";
import DepartmentsTable from "@/components/dashboard/admin/DepartmentsTable";
import RecentConversations from "@/components/dashboard/admin/RecentConversations";

type UserRole = "مدیر کل" | "مدیر" | "کارمند";

const subscribeToLocalStorage = (callback: () => void) => {
  window.addEventListener('storage', callback);
  window.addEventListener('roleChanged', callback);
  window.addEventListener('authChange', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('roleChanged', callback);
    window.removeEventListener('authChange', callback);
  };
};

const getSavedRole = (): UserRole | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem("userRole") as UserRole | null;
};

export default function DashboardPage() {
  const { role, setRole, loadRoleFromStorage } = useRoleStore();
  const router = useRouter();
  const [dateRange, setDateRange] = useState("today");
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ استفاده از هوک آمار داینامیک
  const { stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: trendData, isLoading: trendLoading, error: trendError } = useConversationTrend();

  const savedRole = useSyncExternalStore(subscribeToLocalStorage, getSavedRole, () => null);

  useEffect(() => {
    loadRoleFromStorage();
  }, [loadRoleFromStorage]);

  useEffect(() => {
    if (savedRole && savedRole !== role) {
      setRole(savedRole);
    }
    setIsLoading(false);
  }, [savedRole, role, setRole]);

  useEffect(() => {
    if (!isLoading && !authService.isTokenValid()) {
      router.push("/login");
    }
  }, [isLoading, router]);

  useEffect(() => {
    if (!isLoading && role === "کارمند") {
      router.push("/dashboard/conversations");
    }
  }, [isLoading, role, router]);

  // نمایش لودینگ
  if (isLoading || statsLoading || trendLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#062723] to-[#020504] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#59D8C3] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">در حال بارگذاری داشبورد...</p>
        </div>
      </div>
    );
  }

  if (role === "کارمند") {
    return null;
  }

  if (role === "مدیر") {
    return (
      <DashboardLayout>
        <DepartmentDashboard />
      </DashboardLayout>
    );
  }

  // ✅ مدیر کل: نمایش داشبورد مدیر کل با آمار داینامیک
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

        {statsError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            خطا در دریافت آمار: {statsError}
          </div>
        )}

        {trendError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            خطا در دریافت روند گفتگوها: {trendError}
          </div>
        )}

        {stats && (
          <>
            <StatsCards 
              data={{
                openConversations: stats.openConversations,
                waitingForFirstResponse: stats.waitingForFirstResponse,
                avgResponseTime: stats.avgResponseTime,
                solvedToday: stats.solvedToday,
              }}
              changes={stats.changes}
            />
            <AttentionNeeded />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ConversationTrend data={trendData} />
              <WorkspaceStatus />
            </div>
            <DepartmentsTable />
            <RecentConversations />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}