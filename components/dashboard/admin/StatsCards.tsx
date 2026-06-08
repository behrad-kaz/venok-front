// components/dashboard/admin/StatsCards.tsx
"use client";

import { motion } from "framer-motion";
import { MessageCircle, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface StatsCardsProps {
  data: {
    openConversations: number;
    waitingForResponse: number;
    avgResponseTime: string;
    solvedToday: number;
  };
}

export default function StatsCards({ data }: StatsCardsProps) {
  const stats = [
    {
      id: 1,
      title: "گفتگوهای باز",
      value: data.openConversations,
      change: "+۳ از دیروز",
      changeType: "positive",
      icon: MessageCircle,
      color: "#59D8C3",
    },
    {
      id: 2,
      title: "در انتظار اولین پاسخ",
      value: data.waitingForResponse,
      change: "-۲ از دیروز",
      changeType: "negative",
      icon: Clock,
      color: "#FF6B6B",
    },
    {
      id: 3,
      title: "میانگین زمان پاسخ‌گویی",
      value: data.avgResponseTime,
      change: "↓ ۳ دقیقه",
      changeType: "negative",
      icon: AlertCircle,
      color: "#F2B84B",
    },
    {
      id: 4,
      title: "گفتگوهای حل‌شده امروز",
      value: data.solvedToday,
      change: "+۵ از دیروز",
      changeType: "positive",
      icon: CheckCircle,
      color: "#5BE0A8",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl hover:border-[rgba(89,216,195,0.3)] transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(89,216,195,0.1)] border border-[rgba(89,216,195,0.2)] flex items-center justify-center">
              <stat.icon className="w-4 h-4 text-[#59D8C3]" />
            </div>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                stat.changeType === "positive"
                  ? "text-green-400 bg-[rgba(91,224,168,0.1)]"
                  : "text-red-400 bg-[rgba(255,107,107,0.1)]"
              }`}
            >
              {stat.change}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-1">{stat.title}</p>
          <p className="text-2xl font-bold text-white">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}