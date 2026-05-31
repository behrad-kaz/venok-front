// components/dashboard/reports/StatsCards.tsx
"use client";

import { motion } from "framer-motion";
import { FileText, CheckCircle, Clock, AlertCircle, Building2 } from "lucide-react";

interface StatsCardsProps {
  dateRange: "today" | "week" | "month" | "quarter";
  isManager?: boolean;
  managerDepartment?: string;
}

// داده‌های عمومی
const statsData = {
  today: { total: 12, closed: 8, avgResponse: 5, unanswered: 2, topDepartment: "حسابداری" },
  week: { total: 84, closed: 62, avgResponse: 7, unanswered: 9, topDepartment: "سفرهای داخلی" },
  month: { total: 184, closed: 128, avgResponse: 8, unanswered: 16, topDepartment: "سفرهای داخلی" },
  quarter: { total: 512, closed: 380, avgResponse: 9, unanswered: 42, topDepartment: "سفرهای داخلی" },
};

// داده‌های دپارتمان برای مدیر
const departmentStatsData = {
  today: { total: 19, closed: 12, avgResponse: 11, unanswered: 6 },
  week: { total: 86, closed: 58, avgResponse: 13, unanswered: 22 },
  month: { total: 245, closed: 168, avgResponse: 14, unanswered: 48 },
  quarter: { total: 720, closed: 512, avgResponse: 15, unanswered: 132 },
};

export default function StatsCards({ dateRange, isManager, managerDepartment }: StatsCardsProps) {
  const data = isManager ? departmentStatsData[dateRange] : statsData[dateRange];

  const cards = [
    { title: "کل تیکت‌ها", value: data.total, icon: FileText, color: "#59D8C3", bgColor: "rgba(89,216,195,0.1)" },
    { title: "بسته شده", value: data.closed, icon: CheckCircle, color: "#5BE0A8", bgColor: "rgba(91,224,168,0.1)" },
    { title: "میانگین پاسخ", value: `${data.avgResponse} دقیقه`, icon: Clock, color: "#5BE0A8", bgColor: "rgba(91,224,168,0.1)" },
    { title: "بی‌پاسخ", value: data.unanswered, icon: AlertCircle, color: "#F2B84B", bgColor: "rgba(242,184,75,0.1)" },
  ];

  // کارت پرفعال‌ترین فقط برای مدیر کل (غیر مدیر) نمایش داده شود
  if (!isManager) {
    cards.push({
      title: "پرفعال‌ترین",
      value: statsData[dateRange].topDepartment,
      icon: Building2,
      color: "#59D8C3",
      bgColor: "rgba(89,216,195,0.1)",
    });
  }

  const gridCols = isManager ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-5";

  return (
    <div className={`grid ${gridCols} gap-4 mt-6`}>
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-5 hover:border-[#59D8C3]/40 transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-white">{card.value}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: card.bgColor }}>
              <card.icon className="w-5 h-5" style={{ color: card.color }} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}