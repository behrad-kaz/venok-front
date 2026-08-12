// components/dashboard/admin/StatsCards.tsx
"use client";

import { motion } from "framer-motion";
import { MessageCircle, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface StatsCardsProps {
  data: {
    openConversations: number;
    waitingForFirstResponse: number;
    avgResponseTime: string;
    solvedToday: number;
  };
  changes?: {
    openConversations: number;
    waitingForFirstResponse: number;
    solvedToday: number;
  };
  isLoading?: boolean;
}

export default function StatsCards({ data, changes, isLoading = false }: StatsCardsProps) {
  const getChangeText = (value: number) => {
    if (value === 0) return 'بدون تغییر';
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value} از دیروز`;
  };

  const getChangeType = (value: number): "positive" | "negative" | "neutral" => {
    if (value === 0) return 'neutral';
    return value > 0 ? 'positive' : 'negative';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.05)] mb-3" />
            <div className="h-3 bg-[rgba(255,255,255,0.05)] rounded w-1/2 mb-2" />
            <div className="h-8 bg-[rgba(255,255,255,0.05)] rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      id: 1,
      title: "گفتگوهای باز",
      value: data.openConversations,
      change: getChangeText(changes?.openConversations || 0),
      changeType: getChangeType(changes?.openConversations || 0),
      icon: MessageCircle,
      color: "#59D8C3",
    },
    {
      id: 2,
      title: "در انتظار اولین پاسخ",
      value: data.waitingForFirstResponse,
      change: getChangeText(changes?.waitingForFirstResponse || 0),
      changeType: getChangeType(changes?.waitingForFirstResponse || 0),
      icon: Clock,
      color: "#FF6B6B",
    },
    {
      id: 3,
      title: "میانگین زمان پاسخ‌گویی",
      value: data.avgResponseTime,
      change: "محاسبه شده از کل گفتگوها",
      changeType: "neutral",
      icon: AlertCircle,
      color: "#F2B84B",
    },
    {
      id: 4,
      title: "گفتگوهای حل‌شده امروز",
      value: data.solvedToday,
      change: getChangeText(changes?.solvedToday || 0),
      changeType: getChangeType(changes?.solvedToday || 0),
      icon: CheckCircle,
      color: "#5BE0A8",
    },
  ];

  const getChangeColor = (type: "positive" | "negative" | "neutral") => {
    if (type === "positive") return "text-green-400 bg-[rgba(91,224,168,0.1)]";
    if (type === "negative") return "text-red-400 bg-[rgba(255,107,107,0.1)]";
    return "text-gray-400 bg-[rgba(255,255,255,0.05)]";
  };

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
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${getChangeColor(stat.changeType)}`}
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