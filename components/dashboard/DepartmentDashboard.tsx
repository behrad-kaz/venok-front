// components/dashboard/DepartmentDashboard.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api-client";
import { authService } from "@/services/auth.service";
import ManagerStatsCards from "./manager/ManagerStatsCards";
import AttentionNeeded from "./manager/AttentionNeeded";
import QueueStatus from "./manager/QueueStatus";
import MembersTable from "./manager/MembersTable";
import ConversationTrend from "./manager/ConversationTrend";
import RecentConversations from "./manager/RecentConversations";
import DateRangeFilter from "./manager/DateRangeFilter";

// تایپ‌ها
interface DepartmentStats {
  openTickets: number;
  waitingResponse: number;
  avgResponseTime: string;
  onlineMembers: number;
  totalMembers: number;
}

interface AttentionItem {
  id: number;
  title: string;
  buttonText: string;
  buttonLink: string;
  type: "danger" | "warning" | "info";
}

interface QueueStatusData {
  newTickets: number;
  inProgress: number;
  unassigned: number;
  closedToday: number;
}

interface DepartmentMember {
  id: number;
  name: string;
  initial: string;
  status: "online" | "offline";
  openTickets: number;
  avgResponseTime: string;
  lastActivity: string;
  workStatus: "busy" | "normal";
}

interface RecentConversation {
  id: number;
  customerName: string;
  customerPhone: string;
  subject: string;
  assignee: string;
  status: "waiting" | "answered" | "open";
  lastActivity: string;
  isUrgent: boolean;
}

interface TrendData {
  day: string;
  new: number;
  open: number;
  closed: number;
}

export default function DepartmentDashboard() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState("week");
  const [isLoading, setIsLoading] = useState(true);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [departmentName, setDepartmentName] = useState<string>("");
  
  // Stateهای داده
  const [stats, setStats] = useState<DepartmentStats>({
    openTickets: 0,
    waitingResponse: 0,
    avgResponseTime: "۰ دقیقه",
    onlineMembers: 0,
    totalMembers: 0,
  });
  
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);
  const [queueStatus, setQueueStatus] = useState<QueueStatusData>({
    newTickets: 0,
    inProgress: 0,
    unassigned: 0,
    closedToday: 0,
  });
  
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([]);

  // تابع محاسبه زمان نسبی
  const getTimeAgo = useCallback((dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "چند لحظه پیش";
    if (diffMins < 60) return `${diffMins} دقیقه پیش`;
    if (diffHours < 24) return `${diffHours} ساعت پیش`;
    if (diffDays < 7) return `${diffDays} روز پیش`;
    return date.toLocaleDateString("fa-IR");
  }, []);

  // ✅ تابع محاسبه میانگین زمان پاسخ (فقط دقیقه - رند شده)
  const calculateAvgResponseTime = useCallback((conversations: any[]) => {
    const answeredConversations = conversations.filter((conv: any) => {
      const messages = conv.messages || [];
      return messages.some(
        (msg: any) =>
          msg.senderType === "agent" ||
          msg.senderType === "support" ||
          msg.senderType === "admin"
      );
    });

    if (answeredConversations.length === 0) {
      return "۰ دقیقه";
    }

    let totalResponseTime = 0;
    let responseCount = 0;

    answeredConversations.forEach((conv: any) => {
      const messages = conv.messages || [];
      const sortedMessages = [...messages].sort(
        (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      let lastCustomerMessage: any = null;
      
      for (const msg of sortedMessages) {
        if (msg.senderType === "customer") {
          lastCustomerMessage = msg;
        } else if (
          (msg.senderType === "agent" || msg.senderType === "support" || msg.senderType === "admin") &&
          lastCustomerMessage
        ) {
          const customerTime = new Date(lastCustomerMessage.createdAt).getTime();
          const agentTime = new Date(msg.createdAt).getTime();
          
          if (agentTime > customerTime) {
            const responseTime = agentTime - customerTime;
            totalResponseTime += responseTime;
            responseCount++;
            lastCustomerMessage = null;
          }
        }
      }
    });

    if (responseCount === 0) {
      return "۰ دقیقه";
    }

    const avgMs = totalResponseTime / responseCount;
    const avgMinutes = Math.round(avgMs / 60000);

    if (avgMinutes === 0) {
      return "کمتر از ۱ دقیقه";
    }

    return `${avgMinutes} دقیقه`;
  }, []);

  // دریافت اطلاعات دپارتمان و داده‌ها
  const fetchDepartmentData = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1️⃣ دریافت Staff جاری
      const staffId = authService.getStaffId();
      if (!staffId) {
        console.warn("⚠️ staffId وجود ندارد");
        setIsLoading(false);
        return;
      }

      // 2️⃣ دریافت اطلاعات Staff
      const staffResponse = await api.get<{
        id: number;
        departmentId: number | null;
        name: string;
        role: string;
      }>(`/staff/${staffId}`);

      const deptId = staffResponse.departmentId;
      if (!deptId) {
        console.warn("⚠️ کاربر جاری دپارتمان ندارد");
        setIsLoading(false);
        return;
      }

      setDepartmentId(deptId);
      setDepartmentName(staffResponse.name || "دپارتمان");

      // 3️⃣ دریافت دپارتمان‌ها برای نام دپارتمان
      const teamsResponse = await api.get<any[]>("/support/team");
      const teams = Array.isArray(teamsResponse) ? teamsResponse : [];
      const currentTeam = teams.find((t: any) => t.id === deptId);
      if (currentTeam) {
        setDepartmentName(currentTeam.name);
      }

      // 4️⃣ دریافت همه گفتگوها
      const conversationsResponse = await api.get<{ data: any[] }>("/conversation");
      const conversations = conversationsResponse?.data || [];

      // فیلتر گفتگوهای این دپارتمان
      const deptConversations = conversations.filter(
        (conv: any) => conv.teamId === deptId && conv.deletedAt === null
      );

      console.log(`📊 تعداد کل گفتگوهای دپارتمان: ${deptConversations.length}`);

      // 5️⃣ دریافت همه Staffهای این دپارتمان
      const staffResponseAll = await api.get<any[]>("/staff");
      const staffs = Array.isArray(staffResponseAll) ? staffResponseAll : [];
      
      const deptStaffs = staffs.filter(
        (staff: any) =>
          staff.departmentId === deptId &&
          staff.deletedAt === null
      );

      const totalMembers = deptStaffs.length;
      const onlineMembers = deptStaffs.filter((s: any) => s.lastOnlineAt).length;

      // ============ محاسبه آمار ============
      
      // ✅ گفتگوهای باز (open + waiting)
      const openTickets = deptConversations.filter(
        (conv: any) => conv.status === "open" || conv.status === "waiting"
      ).length;

      // ✅ در انتظار اولین پاسخ
      const waitingResponse = deptConversations.filter((conv: any) => {
        if (conv.status !== "open" && conv.status !== "waiting") return false;
        const messages = conv.messages || [];
        const hasCustomer = messages.some((m: any) => m.senderType === "customer");
        const hasAgent = messages.some(
          (m: any) => m.senderType === "agent" || m.senderType === "support" || m.senderType === "admin"
        );
        return hasCustomer && !hasAgent;
      }).length;

      // ✅ تعداد کل گفتگوهای بسته شده (همه تاریخ‌ها)
      const closedToday = deptConversations.filter(
        (conv: any) => conv.status === "closed"
      ).length;

      console.log(`📊 تعداد کل گفتگوهای بسته شده: ${closedToday}`);

      // ✅ میانگین زمان پاسخ
      const avgResponseTime = calculateAvgResponseTime(deptConversations);

      console.log(`📊 آمار نهایی:`, {
        openTickets,
        waitingResponse,
        avgResponseTime,
        closedToday,
        totalMembers,
      });

      setStats({
        openTickets,
        waitingResponse,
        avgResponseTime,
        onlineMembers,
        totalMembers,
      });

      // ============ نیازمند توجه ============
      const attention: AttentionItem[] = [];
      if (waitingResponse > 0) {
        attention.push({
          id: 1,
          title: `${waitingResponse} گفتگو منتظر اولین پاسخ هستند`,
          buttonText: "مشاهده گفتگوها",
          buttonLink: "/dashboard/conversations",
          type: "danger",
        });
      }
      if (openTickets > 5) {
        attention.push({
          id: 2,
          title: `${openTickets} گفتگوی باز در دپارتمان وجود دارد`,
          buttonText: "مشاهده گفتگوها",
          buttonLink: "/dashboard/conversations",
          type: "warning",
        });
      }
      if (attention.length === 0) {
        attention.push({
          id: 3,
          title: "همه چیز خوب است! هیچ مورد نیازمند توجهی وجود ندارد",
          buttonText: "داشبورد",
          buttonLink: "/dashboard",
          type: "info",
        });
      }
      setAttentionItems(attention);

      // ============ وضعیت صف ============
      const newTickets = deptConversations.filter(
        (conv: any) => conv.status === "open" && !conv.agentId
      ).length;
      
      const inProgress = deptConversations.filter(
        (conv: any) => (conv.status === "open" || conv.status === "waiting") && conv.agentId
      ).length;
      
      const unassigned = deptConversations.filter(
        (conv: any) => (conv.status === "open" || conv.status === "waiting") && !conv.agentId
      ).length;

      setQueueStatus({
        newTickets,
        inProgress,
        unassigned,
        closedToday,
      });

      // ============ اعضای دپارتمان ============
      // MembersTable خودش داده‌های اعضا را از API می‌گیرد

      // ============ روند گفتگوها (۷ روز گذشته) ============
      const dayNames = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
      const trend: TrendData[] = [];
      const nowDate = new Date();
      nowDate.setHours(0, 0, 0, 0);

      for (let i = 6; i >= 0; i--) {
        const date = new Date(nowDate);
        date.setDate(date.getDate() - i);
        const dayName = i === 0 ? 'امروز' : dayNames[date.getDay()];
        const dateKey = date.toISOString().split('T')[0];
        
        const dayConvs = deptConversations.filter((conv: any) => {
          if (!conv.createdAt) return false;
          const createdDate = new Date(conv.createdAt);
          const createdDateStr = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}-${String(createdDate.getDate()).padStart(2, '0')}`;
          return createdDateStr === dateKey;
        });
        
        // محاسبه تعداد بسته شده‌ها
        const closedCount = dayConvs.filter((conv: any) => conv.status === "closed").length;
        
        trend.push({
          day: dayName,
          new: dayConvs.length,
          open: dayConvs.filter((c: any) => c.status !== "closed").length,
          closed: closedCount,
        });
      }
      setTrendData(trend);

      // ============ آخرین گفتگوهای مهم ============
      const recent = deptConversations
        .filter((conv: any) => conv.status !== "closed")
        .sort((a: any, b: any) => {
          const dateA = a.lastActivity ? new Date(a.lastActivity).getTime() : new Date(a.createdAt).getTime();
          const dateB = b.lastActivity ? new Date(b.lastActivity).getTime() : new Date(b.createdAt).getTime();
          return dateB - dateA;
        })
        .slice(0, 5)
        .map((conv: any) => ({
          id: conv.id,
          customerName: conv.customer?.name || conv.customerName || "مشتری ناشناس",
          customerPhone: conv.customerPhone || conv.customer?.phone || "نامشخص",
          subject: conv.subject || "بدون موضوع",
          assignee: conv.agent?.name || "",
          status: conv.status || "open",
          lastActivity: conv.lastActivity ? getTimeAgo(conv.lastActivity) : "چند لحظه پیش",
          isUrgent: conv.priority === "urgent",
        }));
      setRecentConversations(recent);

    } catch (error) {
      console.error("❌ خطا در دریافت داده‌های دپارتمان:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getTimeAgo, calculateAvgResponseTime]);

  useEffect(() => {
    fetchDepartmentData();
  }, [fetchDepartmentData]);

  // اگر در حال بارگذاری است
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="h-8 w-48 bg-[rgba(255,255,255,0.05)] rounded animate-pulse" />
            <div className="h-4 w-64 bg-[rgba(255,255,255,0.03)] rounded mt-2 animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-[rgba(255,255,255,0.05)] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] animate-pulse">
              <div className="w-11 h-11 rounded-xl bg-[rgba(255,255,255,0.05)] mb-3" />
              <div className="h-3 bg-[rgba(255,255,255,0.05)] rounded w-1/2 mb-2" />
              <div className="h-8 bg-[rgba(255,255,255,0.05)] rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">داشبورد {departmentName}</h1>
          <p className="text-sm text-gray-500">نمای کلی وضعیت دپارتمان شما</p>
        </div>
        <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      {/* کارت‌های آماری */}
      <ManagerStatsCards 
        stats={{
          openTickets: stats.openTickets,
          waitingResponse: stats.waitingResponse,
          avgResponseTime: stats.avgResponseTime,
          closedToday: queueStatus.closedToday,
          totalMembers: stats.totalMembers,
        }} 
        isLoading={isLoading} 
      />

      {/* نیازمند توجه */}
      <AttentionNeeded items={attentionItems} />

      {/* وضعیت صف دپارتمان */}
      <QueueStatus status={queueStatus} />

      {/* وضعیت اعضای دپارتمان */}
      <MembersTable departmentId={departmentId} />

      {/* روند گفتگوهای دپارتمان */}
      <ConversationTrend data={trendData} />

      {/* گفتگوهای مهم اخیر */}
      <RecentConversations conversations={recentConversations} />
    </div>
  );
}