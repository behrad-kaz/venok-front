"use client";

import { useState } from "react";
import { Activity, Smile, MessageCircle, Clock, ChevronLeft } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { useRoleStore } from "@/stores/useRoleStore";

// کامپوننت‌های گزارشات مدیر کل
import ReportCards from "@/components/dashboard/reports/ReportCards";
import DateRangeFilter from "@/components/dashboard/reports/DateRangeFilter";
import ConversationTrendChart from "@/components/dashboard/reports/ConversationTrend";
import StatusDistributionChart from "@/components/dashboard/reports/StatusDistributionChart";
import DepartmentsTable from "@/components/dashboard/reports/DepartmentsTable";
import MembersTable from "@/components/dashboard/reports/MembersTable";
import TopTopics from "@/components/dashboard/reports/TopTopics";
import PeakHoursChart from "@/components/dashboard/reports/PeakHoursChart";
import Suggestions from "@/components/dashboard/reports/Suggestions";
import {
  departmentsData,
  membersData,
  statsData,
  topTopics,
  suggestions,
} from "@/components/dashboard/reports/data";

// مودال‌های گزارشات مدیر کل
import PerformanceReportModal from "@/components/dashboard/reports/modals/PerformanceReportModal";
import SatisfactionReportModal from "@/components/dashboard/reports/modals/SatisfactionReportModal";
import ConversationsReportModal from "@/components/dashboard/reports/modals/ConversationsReportModal";
import ResponseTimeReportModal from "@/components/dashboard/reports/modals/ResponseTimeReportModal";

// کامپوننت‌های گزارشات مدیر دپارتمان
import DepartmentReportCards from "@/components/dashboard/reports/DepartmentReportCards";
import DepartmentDateRangeFilter from "@/components/dashboard/reports/DepartmentDateRangeFilter";
import DepartmentConversationTrend from "@/components/dashboard/reports/DepartmentConversationTrend";
import DepartmentStatusDistribution from "@/components/dashboard/reports/DepartmentStatusDistribution";
import DepartmentMembersTable from "@/components/dashboard/reports/DepartmentMembersTable";
import DepartmentTopTopics from "@/components/dashboard/reports/DepartmentTopTopics";
import DepartmentResponseStatus from "@/components/dashboard/reports/DepartmentResponseStatus";
import DepartmentSuggestions from "@/components/dashboard/reports/DepartmentSuggestions";

// مودال‌های گزارشات مدیر دپارتمان
import DepartmentPerformanceReportModal from "@/components/dashboard/reports/modals/DepartmentPerformanceReportModal";
import DepartmentSatisfactionReportModal from "@/components/dashboard/reports/modals/DepartmentSatisfactionReportModal";
import DepartmentConversationsReportModal from "@/components/dashboard/reports/modals/DepartmentConversationsReportModal";
import DepartmentResponseTimeReportModal from "@/components/dashboard/reports/modals/DepartmentResponseTimeReportModal";

// داده‌های دمو برای مدیر دپارتمان
const departmentStatsData = {
  totalTickets: 127,
  openTickets: 12,
  solvedTickets: 115,
  avgFirstResponse: "۴ دقیقه",
  resolutionRate: 91,
};

// داده‌های اعضا برای مدیر دپارتمان
const departmentMembersData = [
  {
    id: 1,
    name: "سارا احمدی",
    initials: "سا",
    answeredTickets: 48,
    avgResponseTime: "۳ دقیقه",
    openTickets: 5,
    lastActivity: "۲ دقیقه پیش",
    status: "active" as const,
  },
  {
    id: 2,
    name: "نیلوفر محمدی",
    initials: "نم",
    answeredTickets: 42,
    avgResponseTime: "۵ دقیقه",
    openTickets: 4,
    lastActivity: "۱ دقیقه پیش",
    status: "active" as const,
  },
  {
    id: 3,
    name: "رضا کریمی",
    initials: "رک",
    answeredTickets: 35,
    avgResponseTime: "۶ دقیقه",
    openTickets: 2,
    lastActivity: "۱۵ دقیقه پیش",
    status: "active" as const,
  },
];

const departmentTopicsData = [
  { id: 1, title: "مشکل پرداخت", count: 78, percentage: 27, trend: "up" as const },
  { id: 2, title: "پیگیری سفارش", count: 65, percentage: 23, trend: "stable" as const },
  { id: 3, title: "سوال قبل از خرید", count: 54, percentage: 19, trend: "down" as const },
  { id: 4, title: "سایر موارد", count: 87, percentage: 31, trend: "stable" as const },
];

const departmentSuggestionsData = [
  {
    id: 1,
    title: "چند گفتگو بیشتر از ۱۰ دقیقه در انتظار پاسخ مانده‌اند.",
    type: "warning" as const,
    link: "/dashboard/conversations",
    linkText: "مشاهده گفتگوها",
  },
  {
    id: 2,
    title: "یکی از اعضا تعداد زیادی گفتگوی باز دارد.",
    type: "info" as const,
    link: "/dashboard/members",
    linkText: "بررسی اعضای دپارتمان",
  },
  {
    id: 3,
    title: "حجم گفتگوهای امروز نسبت به میانگین هفته ۲۰٪ بیشتر است.",
    type: "info" as const,
    link: "/dashboard/conversations",
    linkText: "مشاهده گفتگوها",
  },
];

const departmentTrendData = [
  { day: "شنبه", new: 42, solved: 38 },
  { day: "یکشنبه", new: 38, solved: 35 },
  { day: "دوشنبه", new: 45, solved: 42 },
  { day: "سه‌شنبه", new: 40, solved: 38 },
  { day: "چهارشنبه", new: 48, solved: 45 },
  { day: "پنجشنبه", new: 38, solved: 32 },
  { day: "جمعه", new: 33, solved: 26 },
];

const departmentStatusDistribution = {
  open: { label: "باز", count: 28, percentage: 10, color: "#59D8C3" },
  waiting: { label: "در انتظار پاسخ", count: 35, percentage: 12, color: "#F2B84B" },
  answered: { label: "پاسخ داده شده", count: 156, percentage: 55, color: "#8B7FDF" },
  closed: { label: "بسته شده", count: 65, percentage: 23, color: "#9CA3AF" },
};

// کارت‌های گزارش برای مدیر کل
const reportCards = [
  { id: "performance", title: "گزارش عملکرد", icon: Activity, color: "#59D8C3" },
  { id: "satisfaction", title: "گزارش رضایت", icon: Smile, color: "#59D8C3" },
  { id: "conversations", title: "گزارش گفتگوها", icon: MessageCircle, color: "#59D8C3" },
  { id: "responseTime", title: "گزارش زمان پاسخ", icon: Clock, color: "#59D8C3" },
];

export default function ReportsPage() {
  const { role } = useRoleStore();
  const [dateRange, setDateRange] = useState("week");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [openModal, setOpenModal] = useState<string | null>(null);

  const handleExport = () => {
    console.log("خروجی گرفتن از گزارشات");
  };

  // کارت‌های گزارش برای مدیر دپارتمان
  const departmentReportCards = [
    { id: "performance", title: "گزارش عملکرد", icon: "TrendingUp", color: "#59D8C3" },
    { id: "satisfaction", title: "گزارش رضایت", icon: "Smile", color: "#59D8C3" },
    { id: "conversations", title: "گزارش گفتگوها", icon: "MessageCircle", color: "#59D8C3" },
    { id: "responseTime", title: "گزارش زمان پاسخ", icon: "Clock", color: "#59D8C3" },
  ];

  // اگر نقش مدیر دپارتمان است، صفحه اختصاصی را نمایش بده
  if (role === "مدیر") {
    return (
      <RoleGuard allowedRoles={["مدیر"]}>
        <DashboardLayout>
          <div className="space-y-6">
            {/* کارت‌های گزارش */}
            <DepartmentReportCards
              cards={departmentReportCards}
              onCardClick={setOpenModal}
            />

            {/* فیلترها */}
            <DepartmentDateRangeFilter
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              onExport={handleExport}
            />

            {/* کارت‌های آمار */}
            <DepartmentReportCards stats={departmentStatsData} />

            {/* نمودارها */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DepartmentConversationTrend data={departmentTrendData} />
              <DepartmentStatusDistribution data={departmentStatusDistribution} />
            </div>

            {/* عملکرد اعضا */}
            <DepartmentMembersTable members={departmentMembersData} />

            {/* موضوعات پرتکرار و وضعیت پاسخگویی */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DepartmentTopTopics topics={departmentTopicsData} />
              <DepartmentResponseStatus />
            </div>

            {/* پیشنهادهای مدیریتی */}
            <DepartmentSuggestions suggestions={departmentSuggestionsData} />
          </div>

          {/* مودال‌های گزارشات مدیر دپارتمان */}
          <DepartmentPerformanceReportModal
            isOpen={openModal === "performance"}
            onClose={() => setOpenModal(null)}
            departmentName="پشتیبانی"
          />
          <DepartmentSatisfactionReportModal
            isOpen={openModal === "satisfaction"}
            onClose={() => setOpenModal(null)}
            departmentName="پشتیبانی"
          />
          <DepartmentConversationsReportModal
            isOpen={openModal === "conversations"}
            onClose={() => setOpenModal(null)}
            departmentName="پشتیبانی"
          />
          <DepartmentResponseTimeReportModal
            isOpen={openModal === "responseTime"}
            onClose={() => setOpenModal(null)}
            departmentName="پشتیبانی"
          />
        </DashboardLayout>
      </RoleGuard>
    );
  }

  // برای مدیر کل، صفحه اصلی گزارشات را نمایش بده
  if (role === "مدیر کل") {
    return (
      <RoleGuard allowedRoles={["مدیر کل"]}>
        <DashboardLayout>
          <div className="space-y-6">
            {/* کارت‌های گزارش */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setOpenModal(card.id)}
                  className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] hover:border-[#59D8C3] hover:bg-[rgba(89,216,195,0.03)] transition-all text-right group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-[rgba(89,216,195,0.08)] border border-[rgba(89,216,195,0.15)] flex items-center justify-center text-[#59D8C3] group-hover:bg-[rgba(89,216,195,0.15)] transition-all">
                      <card.icon className="w-5 h-5" />
                    </div>
                    <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-[#59D8C3] transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-white mb-1">{card.title}</p>
                  <p className="text-xs text-gray-500">مشاهده جزئیات</p>
                </button>
              ))}
            </div>

            {/* فیلترها */}
            <DateRangeFilter
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              selectedDepartment="all"
              onDepartmentChange={() => {}}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              onExport={handleExport}
              departments={[]}
            />

            {/* کارت‌های آمار */}
            <ReportCards stats={statsData} />

            {/* نمودارها */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ConversationTrendChart />
              <StatusDistributionChart />
            </div>

            {/* عملکرد دپارتمان‌ها */}
            <DepartmentsTable departments={departmentsData} />

            {/* عملکرد اعضا */}
            <MembersTable members={membersData} />

            {/* موضوعات پرتکرار و ساعات پرترافیک */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopTopics topics={topTopics} />
              <PeakHoursChart />
            </div>

            {/* پیشنهادهای عملیاتی */}
            <Suggestions suggestions={suggestions} />
          </div>

          {/* مودال‌های گزارشات مدیر کل */}
          <PerformanceReportModal
            isOpen={openModal === "performance"}
            onClose={() => setOpenModal(null)}
          />
          <SatisfactionReportModal
            isOpen={openModal === "satisfaction"}
            onClose={() => setOpenModal(null)}
          />
          <ConversationsReportModal
            isOpen={openModal === "conversations"}
            onClose={() => setOpenModal(null)}
          />
          <ResponseTimeReportModal
            isOpen={openModal === "responseTime"}
            onClose={() => setOpenModal(null)}
          />
        </DashboardLayout>
      </RoleGuard>
    );
  }

  // برای کارمند
  return (
    <RoleGuard allowedRoles={["کارمند"]}>
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-400">شما دسترسی مشاهده گزارشات را ندارید</p>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}