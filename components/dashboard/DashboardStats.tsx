// components/dashboard/DashboardStats.tsx
"use client";

import { motion } from "framer-motion";
import {
  Clock,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Users,
  Building2,
  TrendingUp,
  Zap,
  Check,
} from "lucide-react";

interface DashboardStatsProps {
  selectedRole?: string;
}

const mainStats = [
  { id: 1, title: "درخواست‌های جدید", value: "24", icon: MessageSquare, color: "#5BE0A8" },
  { id: 2, title: "پاسخ داده نشده", value: "9", icon: AlertCircle, color: "#FF6B6B" },
  { id: 3, title: "در حال پیگیری", value: "128", icon: Clock, color: "#59D8C3" },
  { id: 4, title: "بسته شده", value: "14", icon: Check, color: "#4CAF50" },
  { id: 5, title: "پاسخ داده شده", value: "14", icon: CheckCircle, color: "#4CAF50" },
  { id: 6, title: "میانگین زمان پاسخ", value: "8 دقیقه", icon: Clock, color: "#FF9800" },
  { id: 7, title: "اعضای فعال", value: "0", icon: Users, color: "#59D8C3" },
  { id: 8, title: "دپارتمان‌ها فعال", value: "20", icon: Building2, color: "#59D8C3" },
];

export default function DashboardStats({ selectedRole }: DashboardStatsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#0D1B17] border border-[#59D8C3]/20 rounded-3xl p-4 hover:border-[#59D8C3]/40 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <span className="text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon style={{ color: stat.color }} className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}