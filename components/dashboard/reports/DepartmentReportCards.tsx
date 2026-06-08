"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Smile, 
  MessageCircle, 
  Clock, 
  ChevronLeft,
  Users,
  CheckCircle,
  AlertCircle,
  Activity
} from "lucide-react";

interface DepartmentReportCardsProps {
  cards?: { id: string; title: string; icon: string; color: string }[];
  stats?: {
    totalTickets: number;
    openTickets: number;
    solvedTickets: number;
    avgFirstResponse: string;
    resolutionRate: number;
  };
  onCardClick?: (id: string) => void;
}

const iconMap = {
  TrendingUp: TrendingUp,
  Smile: Smile,
  MessageCircle: MessageCircle,
  Clock: Clock,
};

// آیکون‌های کارت‌های آماری
const statIconMap = {
  totalTickets: MessageCircle,
  openTickets: AlertCircle,
  solvedTickets: CheckCircle,
  avgFirstResponse: Clock,
  resolutionRate: Activity,
};

export default function DepartmentReportCards({ cards, stats, onCardClick }: DepartmentReportCardsProps) {
  // اگر stats وجود داشته باشد، کارت‌های آماری را نمایش بده
  if (stats) {
    const statCards = [
      { 
        id: 1, 
        title: "کل گفتگوهای دپارتمان", 
        value: stats.totalTickets, 
        change: "+۱۲٪", 
        trend: "up", 
        icon: "totalTickets",
        color: "#59D8C3" 
      },
      { 
        id: 2, 
        title: "گفتگوهای باز", 
        value: stats.openTickets, 
        change: "-۵٪", 
        trend: "down", 
        icon: "openTickets",
        color: "#F2B84B" 
      },
      { 
        id: 3, 
        title: "گفتگوهای حل‌شده", 
        value: stats.solvedTickets, 
        change: "+۹٪", 
        trend: "up", 
        icon: "solvedTickets",
        color: "#5BE0A8" 
      },
      { 
        id: 4, 
        title: "میانگین زمان اولین پاسخ", 
        value: stats.avgFirstResponse, 
        change: "-۳٪", 
        trend: "down", 
        icon: "avgFirstResponse",
        color: "#8B7FDF" 
      },
      { 
        id: 5, 
        title: "نرخ حل‌شدن", 
        value: `${stats.resolutionRate}٪`, 
        change: "+۴٪", 
        trend: "up", 
        icon: "resolutionRate",
        color: "#59D8C3" 
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, index) => {
          const Icon = statIconMap[card.icon as keyof typeof statIconMap];
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(89,216,195,0.3)] transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-full bg-[rgba(89,216,195,0.08)] border border-[rgba(89,216,195,0.15)] flex items-center justify-center">
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-[rgba(89,216,195,0.08)] text-[#59D8C3]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points={card.trend === "up" ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                  </svg>
                  <span>{card.change}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-sm text-gray-500">{card.title}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // اگر cards وجود داشته باشد، کارت‌های گزارش را نمایش بده
  if (cards && onCardClick) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const Icon = iconMap[card.icon as keyof typeof iconMap];
          return (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onCardClick(card.id)}
              className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] hover:border-[#59D8C3] hover:bg-[rgba(89,216,195,0.03)] transition-all text-right group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-full bg-[rgba(89,216,195,0.08)] border border-[rgba(89,216,195,0.15)] flex items-center justify-center text-[#59D8C3] group-hover:bg-[rgba(89,216,195,0.15)] transition-all">
                  {Icon && <Icon className="w-5 h-5" />}
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-[#59D8C3] transition-colors" />
              </div>
              <p className="text-sm font-medium text-white mb-1">{card.title}</p>
              <p className="text-xs text-gray-500">مشاهده جزئیات</p>
            </motion.button>
          );
        })}
      </div>
    );
  }

  return null;
}