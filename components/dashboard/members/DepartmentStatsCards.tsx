"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, UsersRound, MessageCircle, UserCheck } from "lucide-react";
import { api } from "@/services/api-client";
import { authService } from "@/services/auth.service";

interface DepartmentStatsCardsProps {
  stats?: {
    totalMembers: number;
    onlineMembers: number;
    totalOpenTickets: number;
    membersWithTickets: number;
  };
  departmentId?: number;
}

export default function DepartmentStatsCards({ stats: propStats, departmentId: propDepartmentId }: DepartmentStatsCardsProps) {
  const [stats, setStats] = useState({
    totalMembers: 0,
    onlineMembers: 0,
    totalOpenTickets: 0,
    membersWithTickets: 0,
  });
  const [isLoading, setIsLoading] = useState(!propStats);

  const fetchStats = useCallback(async () => {
    if (propStats) return;

    try {
      setIsLoading(true);

      const staffId = authService.getStaffId();
      if (!staffId) {
        console.warn("⚠️ staffId وجود ندارد");
        setIsLoading(false);
        return;
      }

      const staffResponse = await api.get<{
        id: number;
        departmentId: number | null;
      }>(`/staff/${staffId}`);

      const departmentId = propDepartmentId || staffResponse.departmentId;
      if (!departmentId) {
        console.warn("⚠️ کاربر جاری دپارتمان ندارد");
        setIsLoading(false);
        return;
      }

      const staffResponseAll = await api.get<{ data: any[] }>("/staff");
      const staffs = staffResponseAll?.data || [];

      const conversationsResponse = await api.get<{ data: any[] }>("/conversation");
      const conversations = conversationsResponse?.data || [];

      const deptStaffs = staffs.filter(
        (staff: any) => staff.departmentId === departmentId && staff.deletedAt === null
      );

      const totalMembers = deptStaffs.length;
      const onlineMembers = deptStaffs.filter((s: any) => s.lastOnlineAt).length;

      const deptConversations = conversations.filter(
        (conv: any) => conv.teamId === departmentId && conv.deletedAt === null
      );

      const staffOpenTickets = new Map<number, number>();
      deptConversations.forEach((conv: any) => {
        if (conv.status === "open" || conv.status === "waiting") {
          const agentId = conv.agentId;
          if (agentId) {
            staffOpenTickets.set(agentId, (staffOpenTickets.get(agentId) || 0) + 1);
          }
        }
      });

      const totalOpenTickets = Array.from(staffOpenTickets.values()).reduce((sum, count) => sum + count, 0);
      const membersWithTickets = staffOpenTickets.size;

      setStats({
        totalMembers,
        onlineMembers,
        totalOpenTickets,
        membersWithTickets,
      });
    } catch (err) {
      console.error("❌ خطا در دریافت آمار دپارتمان:", err);
    } finally {
      setIsLoading(false);
    }
  }, [propStats, propDepartmentId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-full bg-[rgba(255,255,255,0.05)]" />
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
      title: "اعضای دپارتمان",
      value: stats.totalMembers,
      icon: Users,
      color: "#59D8C3",
    },
    {
      id: 2,
      title: "اعضای آنلاین",
      value: stats.onlineMembers,
      icon: UsersRound,
      color: "#5BE0A8",
    },
    {
      id: 3,
      title: "گفتگوهای باز تیم",
      value: stats.totalOpenTickets,
      icon: MessageCircle,
      color: "#F2B84B",
    },
    {
      id: 4,
      title: "اعضای دارای گفتگوی باز",
      value: stats.membersWithTickets,
      icon: UserCheck,
      color: "#8B7FDF",
    },
  ];

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
            <div className="w-11 h-11 rounded-full bg-[rgba(89,216,195,0.08)] border border-[rgba(89,216,195,0.15)] flex items-center justify-center">
              <card.icon className="w-5 h-5" style={{ color: card.color }} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-sm text-gray-500">{card.title}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
