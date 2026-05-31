// app/dashboard/requests/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RequestsTable from "@/components/dashboard/requests/RequestsTable";
import RequestsFilters from "@/components/dashboard/requests/RequestsFilters";
import { useRoleStore } from "@/stores/useRoleStore";

export default function RequestsPage() {
  const { role } = useRoleStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeRangeFilter, setTimeRangeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [ticketsCount, setTicketsCount] = useState({
    all: 0,
    unanswered: 0,
    pending: 0,
    answered: 0,
    closed: 0,
  });

  const handleTicketsChange = useCallback((counts: {
    all: number;
    unanswered: number;
    pending: number;
    answered: number;
    closed: number;
  }) => {
    setTicketsCount(counts);
  }, []);

  const getPageTitle = () => {
    if (role === "مدیر") {
      return {
        title: "درخواست‌ها",
        description: "تیکت‌های دپارتمان",
      };
    }
    if (role === "کارمند") {
      return {
        title: "درخواست‌های من",
        description: "تیکت‌های اختصاص یافته به شما",
      };
    }
    return {
      title: "درخواست‌ها",
      description: "مدیریت و پیگیری تمامی تیکت‌های پشتیبانی",
    };
  };

  const pageTitle = getPageTitle();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{pageTitle.title}</h1>
          <p className="text-gray-400 text-sm mt-1">{pageTitle.description}</p>
        </div>

        {role === "مدیر" && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#59D8C3]/10 border border-[#59D8C3]/20 text-xs text-gray-400">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#59d8c3" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            شما فقط تیکت‌های دپارتمان خودتان را می‌بینید.
          </div>
        )}

        {role === "کارمند" && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#59D8C3]/10 border border-[#59D8C3]/20 text-xs text-gray-400">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#59d8c3" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            شما فقط تیکت‌های اختصاص‌یافته به خودتان را می‌بینید.
          </div>
        )}

        <RequestsFilters
          selectedRole={role}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onTimeRangeChange={setTimeRangeFilter}
          onDepartmentChange={setDepartmentFilter}
          activeStatus={statusFilter}
          selectedTimeRange={timeRangeFilter}
          selectedDepartment={departmentFilter}
          ticketsCount={ticketsCount}
        />

        <RequestsTable
          selectedRole={role}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          timeRangeFilter={timeRangeFilter}
          departmentFilter={departmentFilter}
          onTicketsChange={handleTicketsChange}
        />
      </div>
    </DashboardLayout>
  );
}