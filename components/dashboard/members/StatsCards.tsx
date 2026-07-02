// components/dashboard/members/StatsCards.tsx
"use client";

import { motion } from "framer-motion";
import { Users, UserCog, UsersRound, UserX } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalMembers: number;
    managersCount: number;
    activeMembersCount: number; // ✅ تغییر نام
    inactiveMembersCount: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    { id: 1, title: "کل اعضا", value: stats.totalMembers, icon: Users, color: "#59D8C3" },
    { id: 2, title: "مدیران دپارتمان", value: stats.managersCount, icon: UserCog, color: "#59D8C3" },
    { id: 3, title: "اعضای فعال", value: stats.activeMembersCount, icon: UsersRound, color: "#5BE0A8" }, 
    { id: 4, title: "اعضای غیرفعال", value: stats.inactiveMembersCount, icon: UserX, color: "#FF6B6B" },
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