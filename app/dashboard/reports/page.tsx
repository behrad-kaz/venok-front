// app/dashboard/reports/page.tsx
"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Link from "next/link";
import StatsCards from "@/components/dashboard/reports/StatsCards";
import WeeklyTicketsChart from "@/components/dashboard/reports/WeeklyTicketsChart";
import TicketStatusChart from "@/components/dashboard/reports/TicketStatusChart";
import DepartmentTicketsChart from "@/components/dashboard/reports/DepartmentTicketsChart";
import MemberPerformance from "@/components/dashboard/reports/MemberPerformance";
import DateFilter from "@/components/dashboard/reports/DateFilter";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { useRoleStore } from "@/stores/useRoleStore";

// دپارتمان مدیر (در حالت واقعی از API می‌آید)
const getManagerDepartment = (): string => {
  return "حسابداری";
};

export default function ReportsPage() {
  const { role } = useRoleStore();
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "quarter">("month");
  const [managerDepartment, setManagerDepartment] = useState<string>("");

  useEffect(() => {
    if (role === "مدیر") {
      setManagerDepartment(getManagerDepartment());
    }
  }, [role]);

  const isAdmin = role === "مدیر کل";
  const isManager = role === "مدیر";

  return (
    <RoleGuard allowedRoles={["مدیر کل", "مدیر"]}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          {/* دکمه صفحه اصلی */}
          <div className="relative mb-6">
            <Link
              href="/"
              className="absolute top-0 left-0 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[#59D8C3]/20 text-[11px] text-gray-400 hover:text-white hover:border-[#59D8C3]/40 transition-all duration-300"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              <span>صفحه اصلی</span>
            </Link>
            <div className="pt-10">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-white">گزارش‌ها</h1>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {isManager ? `تحلیل عملکرد دپارتمان ${managerDepartment}` : "تحلیل عملکرد پشتیبانی"}
                  </p>
                </div>
                <DateFilter value={dateRange} onChange={setDateRange} />
              </div>

              {/* هشدار برای نقش مدیر */}
              {isManager && (
                <div className="flex items-center gap-2 px-4 py-2.5 mt-4 rounded-xl bg-[#59D8C3]/10 border border-[#59D8C3]/20 text-xs text-gray-400">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#59d8c3" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  شما فقط گزارش‌های دپارتمان خودتان را می‌بینید.
                </div>
              )}

              {/* کارت‌های آماری */}
              <StatsCards dateRange={dateRange} isManager={isManager} managerDepartment={managerDepartment} />

              {/* نمودار تیکت‌های هفتگی و وضعیت تیکت‌ها */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2">
                  <WeeklyTicketsChart dateRange={dateRange} isManager={isManager} managerDepartment={managerDepartment} />
                </div>
                <div>
                  <TicketStatusChart dateRange={dateRange} isManager={isManager} managerDepartment={managerDepartment} />
                </div>
              </div>

              {/* برای مدیر کل: نمایش نمودار دپارتمان + عملکرد اعضا */}
              {isAdmin && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <DepartmentTicketsChart dateRange={dateRange} />
                  <MemberPerformance dateRange={dateRange} isManager={isManager} managerDepartment={managerDepartment} />
                </div>
              )}

              {/* برای مدیر: فقط نمایش عملکرد اعضا (تمام عرض) */}
              {isManager && (
                <div className="mt-6">
                  <MemberPerformance dateRange={dateRange} isManager={isManager} managerDepartment={managerDepartment} />
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}