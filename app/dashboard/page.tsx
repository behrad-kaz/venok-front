// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentTickets from "@/components/dashboard/RecentTickets";
import OnlineMembers from "@/components/dashboard/OnlineMembers";
import DepartmentPerformance from "@/components/dashboard/DepartmentPerformance";
import RecentActivities from "@/components/dashboard/RecentActivities";
import QuickAccess from "@/components/dashboard/QuickAccess";
import DepartmentDashboard from "@/components/dashboard/DepartmentDashboard";
import EmployeeDashboard from "@/components/dashboard/EmployeeDashboard";
import { useRoleStore } from "@/stores/useRoleStore";

export default function DashboardPage() {
  const { role, setRole } = useRoleStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedRole = localStorage.getItem("userRole") as any;
    if (savedRole && savedRole !== role) {
      setRole(savedRole);
    }
  }, []);

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

  // نمایش داشبورد مخصوص کارمند
  if (role === "کارمند") {
    return (
      <DashboardLayout>
        <EmployeeDashboard />
      </DashboardLayout>
    );
  }

  // نمایش داشبورد عادی برای مدیر کل
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex sm:flex-row items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white">داشبورد مدیریت</h1>
            <p className="text-gray-400 text-sm mt-1">نمای کلی عملکرد پلتفرم</p>
          </div>
          <div className="flex items-center gap-2 mt-1 bg-[#1d4132] border border-[#59D8C3]/40 rounded-2xl px-2 py-1">
            <span className="text-xs text-[#59D8C3] font-medium">{role}</span>
          </div>
        </div>

        <DashboardStats selectedRole={role} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentTickets selectedRole={role} />
          </div>
          <div>
            <OnlineMembers selectedRole={role} />
            <DepartmentPerformance selectedRole={role} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentActivities selectedRole={role} />
          <QuickAccess selectedRole={role} />
        </div>
      </div>
    </DashboardLayout>
  );
}