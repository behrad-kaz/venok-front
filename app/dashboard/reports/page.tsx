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
import { useReportsData } from "@/components/dashboard/reports/hooks/useReportsData";

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

export default function ReportsPage() {
  const { role } = useRoleStore();
  const [dateRange, setDateRange] = useState("week");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [openModal, setOpenModal] = useState<string | null>(null);

  const handleExport = () => {
    console.log("خروجی گرفتن از گزارشات");
  };

  const adminReports = useReportsData(undefined, dateRange, selectedStatus);
  const departmentReports = useReportsData(undefined, dateRange, selectedStatus);

  const reportCards = [
    { id: "performance", title: "گزارش عملکرد", icon: Activity, color: "#59D8C3" },
    { id: "satisfaction", title: "گزارش رضایت", icon: Smile, color: "#59D8C3" },
    { id: "conversations", title: "گزارش گفتگوها", icon: MessageCircle, color: "#59D8C3" },
    { id: "responseTime", title: "گزارش زمان پاسخ", icon: Clock, color: "#59D8C3" },
  ];

  const departmentReportCards = [
    { id: "performance", title: "گزارش عملکرد", icon: "TrendingUp", color: "#59D8C3" },
    { id: "satisfaction", title: "گزارش رضایت", icon: "Smile", color: "#59D8C3" },
    { id: "conversations", title: "گزارش گفتگوها", icon: "MessageCircle", color: "#59D8C3" },
    { id: "responseTime", title: "گزارش زمان پاسخ", icon: "Clock", color: "#59D8C3" },
  ];

  if (role === "مدیر") {
    return (
      <RoleGuard allowedRoles={["مدیر"]}>
        <DashboardLayout>
          <div className="space-y-6">
            <DepartmentReportCards cards={departmentReportCards} onCardClick={setOpenModal} />

            <DepartmentDateRangeFilter
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              onExport={departmentReports.exportToExcel}
            />

            <DepartmentReportCards
              stats={
                departmentReports.stats
                  ? {
                      totalTickets: departmentReports.stats.totalTickets,
                      openTickets: departmentReports.stats.totalTickets - departmentReports.stats.solvedTickets,
                      solvedTickets: departmentReports.stats.solvedTickets,
                      avgFirstResponse: departmentReports.stats.avgFirstResponse,
                      resolutionRate: departmentReports.stats.resolutionRate,
                    }
                  : undefined
              }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DepartmentConversationTrend data={departmentReports.trendData} />
              <DepartmentStatusDistribution data={departmentReports.statusDistribution} />
            </div>

            <DepartmentMembersTable members={departmentReports.members} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DepartmentTopTopics topics={departmentReports.topTopics} />
              <DepartmentResponseStatus />
            </div>

            <DepartmentSuggestions suggestions={departmentReports.suggestions} />

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
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  if (role === "مدیر کل") {
    return (
      <RoleGuard allowedRoles={["مدیر کل"]}>
        <DashboardLayout>
          <div className="space-y-6">
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

            <DateRangeFilter
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              selectedDepartment="all"
              onDepartmentChange={() => {}}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              onExport={adminReports.exportToExcel}
              departments={[]}
            />

            <ReportCards
              stats={
                adminReports.stats
                  ? {
                      totalTickets: adminReports.stats.totalTickets,
                      solvedTickets: adminReports.stats.solvedTickets,
                      avgFirstResponse: adminReports.stats.avgFirstResponse,
                      avgResolutionTime: adminReports.stats.avgResolutionTime,
                      resolutionRate: adminReports.stats.resolutionRate,
                    }
                  : undefined
              }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ConversationTrendChart data={adminReports.trendData} />
              <StatusDistributionChart data={adminReports.statusDistribution} />
            </div>

            <DepartmentsTable departments={adminReports.departments} />

            <MembersTable members={adminReports.members} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopTopics topics={adminReports.topTopics} />
              <PeakHoursChart data={adminReports.peakHours} />
            </div>

            <Suggestions suggestions={adminReports.suggestions} />

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
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

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
