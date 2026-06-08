"use client";

import { useEffect, useState } from "react";
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

export default function DashboardPage() {
  const { role, setRole } = useRoleStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [dateRange, setDateRange] = useState("today");

  useEffect(() => {
    setIsClient(true);
    const savedRole = localStorage.getItem("userRole") as any;
    if (savedRole && savedRole !== role) {
      setRole(savedRole);
    }
  }, []);

  // اگر کارمند است، به صفحه گفتگوهای من ریدایرکت شود
  useEffect(() => {
    if (isClient && role === "کارمند") {
      router.push("/dashboard/my-conversations");
    }
  }, [isClient, role, router]);

  const statsData = {
    openConversations: 24,
    waitingForResponse: 8,
    avgResponseTime: "۱۲ دقیقه",
    solvedToday: 15,
  };

  if (!isClient) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse text-white">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

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
        {/* ... کد داشبورد مدیر کل ... */}
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