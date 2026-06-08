// components/dashboard/DepartmentDashboard.tsx
"use client";

import { useState } from "react";
import { departmentStats, attentionItems, queueStatus, departmentMembers, recentConversations, trendData } from "./manager/data";
import ManagerStatsCards from "./manager/ManagerStatsCards";
import AttentionNeeded from "./manager/AttentionNeeded";
import QueueStatus from "./manager/QueueStatus";
import MembersTable from "./manager/MembersTable";
import ConversationTrend from "./manager/ConversationTrend";
import RecentConversations from "./manager/RecentConversations";
import DateRangeFilter from "./manager/DateRangeFilter";

export default function DepartmentDashboard() {
  const [dateRange, setDateRange] = useState("week");

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">داشبورد</h1>
          <p className="text-sm text-gray-500">نمای کلی وضعیت دپارتمان شما</p>
        </div>
        <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      {/* کارت‌های آماری */}
      <ManagerStatsCards stats={departmentStats} />

      {/* نیازمند توجه */}
      <AttentionNeeded items={attentionItems} />

      {/* وضعیت صف دپارتمان */}
      <QueueStatus status={queueStatus} />

      {/* وضعیت اعضای دپارتمان */}
      <MembersTable members={departmentMembers} />

      {/* روند گفتگوهای دپارتمان */}
      <ConversationTrend data={trendData} />

      {/* گفتگوهای مهم اخیر */}
      <RecentConversations conversations={recentConversations} />
    </div>
  );
}