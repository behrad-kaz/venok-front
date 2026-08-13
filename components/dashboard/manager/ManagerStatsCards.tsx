// components/dashboard/manager/ManagerStatsCards.tsx
"use client";

import { motion } from "framer-motion";
import { MessageCircle, Clock, CheckCircle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api-client";
import { authService } from "@/services/auth.service";

interface ManagerStatsCardsProps {
  stats?: {
    openTickets: number;
    waitingResponse: number;
    avgResponseTime: string;
    closedToday: number;
    totalMembers: number;
  };
  isLoading?: boolean;
}

export default function ManagerStatsCards({ stats: propStats, isLoading: propIsLoading }: ManagerStatsCardsProps) {
  const [stats, setStats] = useState({
    openTickets: 0,
    waitingResponse: 0,
    avgResponseTime: "۰ دقیقه",
    closedToday: 0,
    totalMembers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // محاسبه میانگین زمان پاسخ
  const calculateAvgResponseTime = useCallback((conversations: any[]) => {
    if (conversations.length === 0) {
      return "۰ دقیقه";
    }

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
            const responseTime = agentTime - lastCustomerTime;
            totalResponseTime += responseTime;
            responseCount++;
            firstAgentAfterCustomer = true;
          }
        }
      }
    });

    if (responseCount === 0) {
      return "۰ دقیقه";
    }

    const avgMs = totalResponseTime / responseCount;
    const avgMinutes = Math.round(avgMs / 60000);

    if (avgMinutes < 1) {
      return "کمتر از ۱ دقیقه";
    }

    return `${avgMinutes} دقیقه`;
  }, []);

  // دریافت آمار دپارتمان مدیر
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        const staffId = authService.getStaffId();
        if (!staffId) {
          console.warn("⚠️ staffId وجود ندارد");
          setStats({
            openTickets: 0,
            waitingResponse: 0,
            avgResponseTime: "۰ دقیقه",
            closedToday: 0,
            totalMembers: 0,
          });
          setIsLoading(false);
          return;
        }

        const staffResponse = await api.get<{
          id: number;
          departmentId: number | null;
          name: string;
          role: string;
        }>(`/staff/${staffId}`);

        const departmentId = staffResponse.departmentId;

        if (!departmentId) {
          console.warn("⚠️ کاربر جاری دپارتمان ندارد");
          setStats({
            openTickets: 0,
            waitingResponse: 0,
            avgResponseTime: "۰ دقیقه",
            closedToday: 0,
            totalMembers: 0,
          });
          setIsLoading(false);
          return;
        }

        console.log(`📊 دریافت آمار برای دپارتمان ${departmentId}`);

        const conversationsResponse = await api.get<{ data: any[] }>("/conversation");
        const conversations = conversationsResponse?.data || [];

        const departmentConversations = conversations.filter(
          (conv: any) =>
            conv.teamId === departmentId &&
            conv.deletedAt === null
        );

        const staffResponseAll = await api.get<any[]>("/staff");
        const staffs = Array.isArray(staffResponseAll) ? staffResponseAll : [];
        
        const departmentStaffs = staffs.filter(
          (staff: any) =>
            staff.departmentId === departmentId &&
            staff.deletedAt === null &&
            staff.isActive !== false
        );

        const totalMembers = departmentStaffs.length;

        const openTickets = departmentConversations.filter(
          (conv: any) =>
            conv.status === "open" || conv.status === "waiting"
        ).length;

        const waitingResponse = departmentConversations.filter((conv: any) => {
          if (conv.status !== "open" && conv.status !== "waiting") return false;
          const messages = conv.messages || [];
          const hasCustomerMessage = messages.some(
            (msg: any) => msg.senderType === "customer"
          );
          const hasAgentMessage = messages.some(
            (msg: any) =>
              msg.senderType === "agent" ||
              msg.senderType === "support" ||
              msg.senderType === "admin"
          );
          return hasCustomerMessage && !hasAgentMessage;
        }).length;

        // ✅ تعداد کل گفتگوهای بسته شده
        const closedToday = departmentConversations.filter(
          (conv: any) => conv.status === "closed"
        ).length;

        console.log(`📊 گفتگوهای بسته شده (کل): ${closedToday}`);

        const answeredConversations = departmentConversations.filter(
          (conv: any) =>
            conv.status === "answered" || conv.status === "closed"
        );
        
        const avgResponseTime = calculateAvgResponseTime(answeredConversations);

        setStats({
          openTickets,
          waitingResponse,
          avgResponseTime,
          closedToday,
          totalMembers,
        });

      } catch (error) {
        console.error("❌ خطا در دریافت آمار دپارتمان:", error);
        setStats({
          openTickets: 0,
          waitingResponse: 0,
          avgResponseTime: "۰ دقیقه",
          closedToday: 0,
          totalMembers: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    // اگر stats از props آمده باشد از آن استفاده کن
    if (propStats) {
      console.log("📊 استفاده از props stats:", propStats);
      setStats({
        openTickets: propStats.openTickets || 0,
        waitingResponse: propStats.waitingResponse || 0,
        avgResponseTime: propStats.avgResponseTime || "۰ دقیقه",
        closedToday: propStats.closedToday || 0,
        totalMembers: propStats.totalMembers || 0,
      });
      setIsLoading(propIsLoading || false);
      return;
    }

    fetchStats();
  }, [propStats, propIsLoading, calculateAvgResponseTime]);

  // نمایش لودینگ
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-[rgba(255,255,255,0.05)]" />
              <div className="w-16 h-4 bg-[rgba(255,255,255,0.05)] rounded" />
            </div>
            <div className="h-3 bg-[rgba(255,255,255,0.05)] rounded w-1/2 mb-2" />
            <div className="h-8 bg-[rgba(255,255,255,0.05)] rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      id: 1,
      title: "گفتگوهای باز دپارتمان",
      value: stats.openTickets,
      icon: MessageCircle,
      color: "#59D8C3",
    },
    {
      id: 2,
      title: "در انتظار اولین پاسخ",
      value: stats.waitingResponse,
      icon: Clock,
      color: "#F2B84B",
    },
    {
      id: 3,
      title: "میانگین زمان پاسخ",
      value: stats.avgResponseTime,
      icon: Clock,
      color: "#59D8C3",
    },
    {
      id: 4,
      title: "گفتگوهای بسته شده",
      value: stats.closedToday,
      icon: CheckCircle,
      color: "#5BE0A8",
    },
  ];

  console.log("📊 رندر ManagerStatsCards با stats:", stats);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(89,216,195,0.3)] transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-[rgba(89,216,195,0.08)] border border-[rgba(89,216,195,0.15)] flex items-center justify-center">
              <card.icon className="w-5 h-5" style={{ color: card.color }} />
            </div>
            {card.id === 1 && stats.totalMembers > 0 && (
              <span className="text-xs font-medium text-gray-500">
                {stats.totalMembers} عضو
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-1">{card.title}</p>
          <p className="text-2xl font-bold text-white">{card.value}</p>
        </motion.div>
      ))}
    </div>
  );
}