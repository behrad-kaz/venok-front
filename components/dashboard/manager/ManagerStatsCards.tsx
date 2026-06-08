// components/dashboard/manager/ManagerStatsCards.tsx
"use client";

import { motion } from "framer-motion";
import { MessageCircle, Clock, Users, AlertCircle } from "lucide-react";

interface ManagerStatsCardsProps {
  stats: {
    openTickets: number;
    waitingResponse: number;
    avgResponseTime: string;
    onlineMembers: number;
    totalMembers: number;
  };
}

export default function ManagerStatsCards({ stats }: ManagerStatsCardsProps) {
  const cards = [
    { id: 1, title: "گفتگوهای باز دپارتمان", value: stats.openTickets, change: "+۲ از دیروز", icon: MessageCircle, color: "#59D8C3" },
    { id: 2, title: "در انتظار اولین پاسخ", value: stats.waitingResponse, icon: Clock, color: "#59D8C3" },
    { id: 3, title: "میانگین زمان پاسخ", value: stats.avgResponseTime, improvement: "بهبود ۱۵٪", icon: Clock, color: "#59D8C3" },
    { id: 4, title: "اعضای آنلاین", value: `${stats.onlineMembers} / ${stats.totalMembers}`, icon: Users, color: "#59D8C3" },
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
            <div className="w-11 h-11 rounded-xl bg-[rgba(89,216,195,0.08)] border border-[rgba(89,216,195,0.15)] flex items-center justify-center">
              <card.icon className="w-5 h-5" style={{ color: card.color }} />
            </div>
            {card.change && (
              <span className="text-xs font-medium text-gray-500">{card.change}</span>
            )}
            {card.improvement && (
              <span className="text-xs font-medium text-[#59D8C3]">{card.improvement}</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-1">{card.title}</p>
          <p className="text-2xl font-bold text-white">{card.value}</p>
        </motion.div>
      ))}
    </div>
  );
}