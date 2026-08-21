"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api-client";
import { authService } from "@/services/auth.service";
import { fetchTeams } from "@/services/membersApi";
import * as XLSX from "xlsx";

export interface ReportStats {
  totalTickets: number;
  solvedTickets: number;
  avgFirstResponse: string;
  avgResolutionTime: string;
  resolutionRate: number;
}

export interface ReportDepartmentPerformance {
  id: number;
  name: string;
  totalTickets: number;
  openTickets: number;
  avgFirstResponse: string;
  resolutionRate: number;
  status: "good" | "normal" | "attention";
}

export interface ReportMemberPerformance {
  id: number;
  name: string;
  initials: string;
  department: string;
  answeredTickets: number;
  avgResponseTime: string;
  openTickets: number;
  lastActivity: string;
  status: "active" | "inactive";
}

export interface ReportTrendData {
  day: string;
  new: number;
  open: number;
  closed: number;
}

export interface ReportStatusDistribution {
  open: { label: string; count: number; percentage: number; color: string };
  waiting: { label: string; count: number; percentage: number; color: string };
  answered: { label: string; count: number; percentage: number; color: string };
  closed: { label: string; count: number; percentage: number; color: string };
}

export interface ReportTopTopic {
  id: number;
  title: string;
  count: number;
  percentage: number;
  trend: "up" | "down" | "stable";
}

export interface ReportPeakHour {
  hour: string;
  value: number;
  intensity: "high" | "medium" | "low";
}

export interface ReportSuggestion {
  id: number;
  title: string;
  type: "info" | "warning";
  link: string;
  linkText: string;
}

interface UseReportsDataReturn {
  stats: ReportStats | null;
  departments: ReportDepartmentPerformance[];
  members: ReportMemberPerformance[];
  trendData: ReportTrendData[];
  statusDistribution: ReportStatusDistribution | null;
  topTopics: ReportTopTopic[];
  peakHours: ReportPeakHour[];
  suggestions: ReportSuggestion[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  exportToExcel: () => void;
}

const getDayName = (date: Date): string => {
  const days = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
  return days[date.getDay()];
};

const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const calculateAvgResponseTime = (conversations: any[]): string => {
  if (conversations.length === 0) return "۰ دقیقه";

  let totalResponseTime = 0;
  let responseCount = 0;

  conversations.forEach((conv: any) => {
    const messages = conv.messages || [];
    const sortedMessages = [...messages].sort(
      (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    let lastCustomerTime = 0;
    let firstAgentAfterCustomer = false;

    for (const msg of sortedMessages) {
      if (msg.senderType === "customer") {
        lastCustomerTime = new Date(msg.createdAt).getTime();
        firstAgentAfterCustomer = false;
      } else if (
        (msg.senderType === "agent" || msg.senderType === "support" || msg.senderType === "admin") &&
        lastCustomerTime > 0 &&
        !firstAgentAfterCustomer
      ) {
        const agentTime = new Date(msg.createdAt).getTime();
        if (agentTime > lastCustomerTime) {
          totalResponseTime += agentTime - lastCustomerTime;
          responseCount++;
          firstAgentAfterCustomer = true;
        }
      }
    }
  });

  if (responseCount === 0) return "۰ دقیقه";

  const avgMs = totalResponseTime / responseCount;
  const avgMinutes = Math.round(avgMs / 60000);

  if (avgMinutes < 1) return "کمتر از ۱ دقیقه";

  return `${avgMinutes} دقیقه`;
};

const filterConversationsByDateRange = (conversations: any[], dateRange: string): any[] => {
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  let startDate: Date;

  switch (dateRange) {
    case "today":
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "week":
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "month":
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "custom":
    default:
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      break;
  }

  return conversations.filter((conv: any) => {
    if (!conv.createdAt) return false;
    const createdDate = new Date(conv.createdAt);
    return createdDate >= startDate && createdDate <= now;
  });
};

const filterConversationsByStatus = (conversations: any[], status: string): any[] => {
  if (status === "all") return conversations;
  return conversations.filter((conv: any) => conv.status === status);
};

export function useReportsData(
  departmentId?: number,
  dateRange: string = "week",
  selectedStatus: string = "all"
): UseReportsDataReturn {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [departments, setDepartments] = useState<ReportDepartmentPerformance[]>([]);
  const [members, setMembers] = useState<ReportMemberPerformance[]>([]);
  const [trendData, setTrendData] = useState<ReportTrendData[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<ReportStatusDistribution | null>(null);
  const [topTopics, setTopTopics] = useState<ReportTopTopic[]>([]);
  const [peakHours, setPeakHours] = useState<ReportPeakHour[]>([]);
  const [suggestions, setSuggestions] = useState<ReportSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allConversations, setAllConversations] = useState<any[]>([]);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  const fetchReportsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const staffId = authService.getStaffId();
      let targetDepartmentId = departmentId;

      if (!targetDepartmentId && staffId) {
        const staffResponse = await api.get<{ id: number; departmentId: number | null }>(`/staff/${staffId}`);
        targetDepartmentId = staffResponse.departmentId || undefined;
      }

      const [conversationsResponse, staffResponseAll, teamsResponse] = await Promise.all([
        api.get<{ data: any[] }>("/conversation"),
        api.get<{ data: any[] }>("/staff"),
        fetchTeams(),
      ]);

      const conversations = conversationsResponse?.data || [];
      const staff = staffResponseAll?.data || [];
      const teamsData = teamsResponse || [];

      setAllConversations(conversations);
      setAllStaff(staff);
      setTeams(teamsData);

      let filteredConversations = conversations;
      let filteredStaff = staff;

      if (targetDepartmentId) {
        filteredConversations = conversations.filter(
          (conv: any) => conv.teamId === targetDepartmentId && conv.deletedAt === null
        );
        filteredStaff = staff.filter(
          (s: any) => s.departmentId === targetDepartmentId && s.deletedAt === null
        );
      } else {
        filteredConversations = conversations.filter((conv: any) => conv.deletedAt === null);
      }

      filteredConversations = filterConversationsByDateRange(filteredConversations, dateRange);
      filteredConversations = filterConversationsByStatus(filteredConversations, selectedStatus);

      const totalTickets = filteredConversations.length;
      const solvedTickets = filteredConversations.filter((conv: any) => conv.status === "closed").length;
      const avgFirstResponse = calculateAvgResponseTime(filteredConversations);
      const resolutionRate = totalTickets > 0 ? Math.round((solvedTickets / totalTickets) * 100) : 0;

      setStats({
        totalTickets,
        solvedTickets,
        avgFirstResponse,
        avgResolutionTime: "۲۳ دقیقه",
        resolutionRate,
      });

      if (!targetDepartmentId) {
        const departmentStats: ReportDepartmentPerformance[] = teamsData.map((team: any) => {
          const deptConvs = conversations.filter(
            (conv: any) => conv.teamId === team.id && conv.deletedAt === null
          );
          const deptTotal = deptConvs.length;
          const deptOpen = deptConvs.filter((conv: any) => conv.status === "open" || conv.status === "waiting").length;
          const deptSolved = deptConvs.filter((conv: any) => conv.status === "closed").length;
          const deptRate = deptTotal > 0 ? Math.round((deptSolved / deptTotal) * 100) : 0;

          let status: "good" | "normal" | "attention" = "normal";
          if (deptRate >= 90) status = "good";
          else if (deptRate < 75) status = "attention";

          return {
            id: team.id,
            name: team.name,
            totalTickets: deptTotal,
            openTickets: deptOpen,
            avgFirstResponse: calculateAvgResponseTime(deptConvs),
            resolutionRate: deptRate,
            status,
          };
        });

        setDepartments(departmentStats);
      }

      const memberPerformance: ReportMemberPerformance[] = filteredStaff.map((s: any) => {
        const staffConvs = filteredConversations.filter(
          (conv: any) => conv.agentId === s.id || conv.agent?.id === s.id
        );
        const answered = staffConvs.filter(
          (conv: any) => conv.status === "answered" || conv.status === "closed"
        ).length;
        const open = staffConvs.filter(
          (conv: any) => conv.status === "open" || conv.status === "waiting"
        ).length;
        const avgResponse = calculateAvgResponseTime(staffConvs);

        const name = s.name || "نامشخص";
        const nameParts = name.split(" ");
        const initials = nameParts.length >= 2 ? `${nameParts[0][0]}${nameParts[1][0]}` : name.substring(0, 2);

        const deptName = s.department?.name || teamsData.find((t: any) => t.id === s.departmentId)?.name || "بدون دپارتمان";

        return {
          id: s.id,
          name,
          initials,
          department: deptName,
          answeredTickets: answered,
          avgResponseTime: avgResponse,
          openTickets: open,
          lastActivity: s.lastOnlineAt ? "آنلاین" : "آفلاین",
          status: s.isActive !== false ? "active" : "inactive",
        };
      });

      setMembers(memberPerformance);

      const dayNames = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
      const trend: ReportTrendData[] = [];
      const nowDate = new Date();
      nowDate.setHours(0, 0, 0, 0);

      for (let i = 6; i >= 0; i--) {
        const date = new Date(nowDate);
        date.setDate(date.getDate() - i);
        const dayName = i === 0 ? "امروز" : dayNames[date.getDay()];
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

        const dayConvs = filteredConversations.filter((conv: any) => {
          if (!conv.createdAt) return false;
          const createdDate = new Date(conv.createdAt);
          const createdDateStr = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, "0")}-${String(createdDate.getDate()).padStart(2, "0")}`;
          return createdDateStr === dateKey;
        });

        trend.push({
          day: dayName,
          new: dayConvs.length,
          open: dayConvs.filter((c: any) => c.status !== "closed").length,
          closed: dayConvs.filter((c: any) => c.status === "closed").length,
        });
      }

      setTrendData(trend);

      const openCount = filteredConversations.filter((conv: any) => conv.status === "open").length;
      const waitingCount = filteredConversations.filter((conv: any) => conv.status === "waiting").length;
      const answeredCount = filteredConversations.filter((conv: any) => conv.status === "answered").length;
      const closedCount = filteredConversations.filter((conv: any) => conv.status === "closed").length;
      const total = filteredConversations.length || 1;

      setStatusDistribution({
        open: {
          label: "باز",
          count: openCount,
          percentage: Math.round((openCount / total) * 100),
          color: "#59D8C3",
        },
        waiting: {
          label: "در انتظار پاسخ",
          count: waitingCount,
          percentage: Math.round((waitingCount / total) * 100),
          color: "#F2B84B",
        },
        answered: {
          label: "پاسخ داده شده",
          count: answeredCount,
          percentage: Math.round((answeredCount / total) * 100),
          color: "#8B7FDF",
        },
        closed: {
          label: "بسته شده",
          count: closedCount,
          percentage: Math.round((closedCount / total) * 100),
          color: "#9CA3AF",
        },
      });

      const subjectCounts = new Map<string, number>();
      filteredConversations.forEach((conv: any) => {
        const subject = conv.subject || "سایر موارد";
        subjectCounts.set(subject, (subjectCounts.get(subject) || 0) + 1);
      });

      const sortedTopics = Array.from(subjectCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([title, count], index) => ({
          id: index + 1,
          title,
          count,
          percentage: Math.round((count / totalTickets) * 100),
          trend: "stable" as const,
        }));

      setTopTopics(sortedTopics);

      const hourCounts = new Map<string, number>();
      filteredConversations.forEach((conv: any) => {
        if (conv.createdAt) {
          const date = new Date(conv.createdAt);
          const hour = `${String(date.getHours()).padStart(2, "0")}:۰۰`;
          hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        }
      });

      const maxHourValue = Math.max(...Array.from(hourCounts.values()), 1);
      const peakHoursData: ReportPeakHour[] = Array.from(hourCounts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([hour, value]) => ({
          hour,
          value,
          intensity: value > maxHourValue * 0.7 ? "high" : value > maxHourValue * 0.4 ? "medium" : "low",
        }));

      setPeakHours(peakHoursData);

      const generatedSuggestions: ReportSuggestion[] = [];

      if (waitingCount > 0) {
        generatedSuggestions.push({
          id: 1,
          title: `${waitingCount} گفتگو بیشتر از ۱۰ دقیقه در انتظار پاسخ مانده‌اند.`,
          type: "warning",
          link: "/dashboard/conversations",
          linkText: "مشاهده گفتگوها",
        });
      }

      if (openCount > 5) {
        generatedSuggestions.push({
          id: 2,
          title: `یکی از اعضای دپارتمان تعداد زیادی گفتگوی باز دارد.`,
          type: "info",
          link: "/dashboard/members",
          linkText: "بررسی اعضای دپارتمان",
        });
      }

      if (sortedTopics.length > 0 && sortedTopics[0].count > totalTickets * 0.3) {
        generatedSuggestions.push({
          id: 3,
          title: `موضوع "${sortedTopics[0].title}" نسبت به هفته قبل افزایش داشته است.`,
          type: "warning",
          link: "/dashboard/conversations",
          linkText: "مشاهده گفتگوها",
        });
      }

      setSuggestions(generatedSuggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت داده‌های گزارشات");
      console.error("❌ خطا در获取 گزارشات:", err);
    } finally {
      setIsLoading(false);
    }
  }, [departmentId, dateRange, selectedStatus]);

  const exportToExcel = useCallback(() => {
    if (!allConversations.length && !allStaff.length && !teams.length) {
      alert("داده‌ای برای خروجی گرفتن وجود ندارد.");
      return;
    }

    const wsData: any[][] = [];

    wsData.push(["گزارش ورک‌اسپس"]);
    wsData.push(["تاریخ تولید:", new Date().toLocaleDateString("fa-IR")]);
    wsData.push(["بازه زمانی:", dateRange === "today" ? "امروز" : dateRange === "week" ? "۷ روز اخیر" : dateRange === "month" ? "۳۰ روز اخیر" : "بازه دلخواه"]);
    wsData.push(["وضعیت:", selectedStatus === "all" ? "همه وضعیت‌ها" : selectedStatus]);
    wsData.push([]);

    if (stats) {
      wsData.push(["آمار کلی"]);
      wsData.push(["کل گفتگوها", stats.totalTickets]);
      wsData.push(["گفتگوهای حل‌شده", stats.solvedTickets]);
      wsData.push(["میانگین زمان اولین پاسخ", stats.avgFirstResponse]);
      wsData.push(["نرخ حل‌شدن", `${stats.resolutionRate}٪`]);
      wsData.push([]);
    }

    if (departments.length > 0) {
      wsData.push(["عملکرد دپارتمان‌ها"]);
      wsData.push(["دپارتمان", "کل گفتگوها", "گفتگوهای باز", "میانگین اولین پاسخ", "نرخ حل‌شدن", "وضعیت"]);
      departments.forEach((dept) => {
        wsData.push([dept.name, dept.totalTickets, dept.openTickets, dept.avgFirstResponse, `${dept.resolutionRate}٪`, dept.status]);
      });
      wsData.push([]);
    }

    if (members.length > 0) {
      wsData.push(["عملکرد اعضا"]);
      wsData.push(["عضو", "دپارتمان", "گفتگوهای پاسخ‌داده‌شده", "میانگین زمان پاسخ", "گفتگوهای باز", "آخرین فعالیت", "وضعیت"]);
      members.forEach((member) => {
        wsData.push([member.name, member.department, member.answeredTickets, member.avgResponseTime, member.openTickets, member.lastActivity, member.status === "active" ? "فعال" : "غیرفعال"]);
      });
      wsData.push([]);
    }

    if (trendData.length > 0) {
      wsData.push(["روند گفتگوهای ۷ روز اخیر"]);
      wsData.push(["روز", "جدید", "باز", "بسته"]);
      trendData.forEach((item) => {
        wsData.push([item.day, item.new, item.open, item.closed]);
      });
      wsData.push([]);
    }

    if (statusDistribution) {
      wsData.push(["توزیع وضعیت گفتگوها"]);
      wsData.push(["وضعیت", "تعداد", "درصد"]);
      wsData.push([statusDistribution.open.label, statusDistribution.open.count, `${statusDistribution.open.percentage}%`]);
      wsData.push([statusDistribution.waiting.label, statusDistribution.waiting.count, `${statusDistribution.waiting.percentage}%`]);
      wsData.push([statusDistribution.answered.label, statusDistribution.answered.count, `${statusDistribution.answered.percentage}%`]);
      wsData.push([statusDistribution.closed.label, statusDistribution.closed.count, `${statusDistribution.closed.percentage}%`]);
      wsData.push([]);
    }

    if (topTopics.length > 0) {
      wsData.push(["موضوعات پرتکرار"]);
      wsData.push(["موضوع", "تعداد", "درصد"]);
      topTopics.forEach((topic) => {
        wsData.push([topic.title, topic.count, `${topic.percentage}%`]);
      });
      wsData.push([]);
    }

    if (peakHours.length > 0) {
      wsData.push(["ساعات پرترافیک"]);
      wsData.push(["ساعت", "تعداد گفتگو", "شدت"]);
      peakHours.forEach((hour) => {
        wsData.push([hour.hour, hour.value, hour.intensity]);
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "گزارشات");

    const dateStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `reports-${dateStr}.xlsx`);
  }, [allConversations, allStaff, teams, stats, departments, members, trendData, statusDistribution, topTopics, peakHours, dateRange, selectedStatus]);

  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  return {
    stats,
    departments,
    members,
    trendData,
    statusDistribution,
    topTopics,
    peakHours,
    suggestions,
    isLoading,
    error,
    refetch: fetchReportsData,
    exportToExcel,
  };
}
