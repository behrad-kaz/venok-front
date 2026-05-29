// components/dashboard/RecentActivities.tsx
"use client";

import { motion } from "framer-motion";
import { Bell, UserCheck, Building2, UserPlus, CheckCircle, Settings } from "lucide-react";

interface RecentActivitiesProps {
  selectedRole?: string;
}

const activities = [
  {
    id: 1,
    title: "تیکت #1042 به امیر حسینی اختصاص داده شد",
    time: "۱۵ دقیقه پیش",
    icon: UserCheck,
    color: "#59D8C3",
    type: "assign"
  },
  {
    id: 2,
    title: "دپارتمان سفرهای داخلی فعال شد",
    time: "۱ ساعت پیش",
    icon: Building2,
    color: "#5BE0A8",
    type: "department"
  },
  {
    id: 3,
    title: "کاربر جدید الهام کاظمی ایجاد شد",
    time: "۳ ساعت پیش",
    icon: UserPlus,
    color: "#4CAF50",
    type: "user"
  },
  {
    id: 4,
    title: "تیکت #1039 بسته شد",
    time: "دیروز ۱۶:۲۰",
    icon: CheckCircle,
    color: "#FF9800",
    type: "closed"
  },
  {
    id: 5,
    title: "تنظیمات ویجت به‌روزرسانی شد",
    time: "دیروز ۱۱:۰۰",
    icon: Settings,
    color: "#2196F3",
    type: "settings"
  },
];

export default function RecentActivities({ selectedRole }: RecentActivitiesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-[#0D1B17] border border-[#59D8C3]/20 rounded-xl overflow-hidden"
    >
      {/* هدر */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#59D8C3]" />
          <h3 className="text-lg font-semibold text-white">فعالیت‌های اخیر</h3>
        </div>
      </div>

      {/* لیست فعالیت‌ها */}
      <div>
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center justify-between p-4 hover:bg-[#12251F] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${activity.color}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color: activity.color }} />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{activity.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{activity.time}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}