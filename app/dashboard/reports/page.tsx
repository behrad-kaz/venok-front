// app/dashboard/reports/page.tsx
"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Link from "next/link";
import StatsCards from "@/components/dashboard/reports/StatsCards";
import WeeklyTicketsChart from "@/components/dashboard/reports/WeeklyTicketsChart";
import TicketStatusChart from "@/components/dashboard/reports/TicketStatusChart";
import DepartmentTicketsChart from "@/components/dashboard/reports/DepartmentTicketsChart";
import MemberPerformance from "@/components/dashboard/reports/MemberPerformance";
import DateFilter from "@/components/dashboard/reports/DateFilter";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "quarter">("month");

  return (
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
                <p className="text-gray-400 text-sm mt-0.5">تحلیل عملکرد پشتیبانی</p>
              </div>
              <DateFilter value={dateRange} onChange={setDateRange} />
            </div>

            {/* کارت‌های آماری */}
            <StatsCards dateRange={dateRange} />

            {/* نمودار تیکت‌های هفتگی و وضعیت تیکت‌ها */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2">
                <WeeklyTicketsChart dateRange={dateRange} />
              </div>
              <div>
                <TicketStatusChart dateRange={dateRange} />
              </div>
            </div>

            {/* نمودار تیکت بر اساس دپارتمان و عملکرد اعضا */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <DepartmentTicketsChart dateRange={dateRange} />
              <MemberPerformance dateRange={dateRange} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}