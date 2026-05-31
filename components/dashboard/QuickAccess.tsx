// components/dashboard/QuickAccess.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  UserPlus,
  Building2,
  Eye,
  Settings,
  Zap,
} from "lucide-react";

interface QuickAccessProps {
  selectedRole?: string;
}

const quickAccessItems = [
  { id: 1, title: "افزودن عضو", icon: UserPlus, href: "/dashboard/members" },
  { id: 2, title: "افزودن دپارتمان", icon: Building2, href: "/dashboard/departments" },
  { id: 3, title: "مشاهده درخواست‌ها", icon: Eye, href: "/dashboard/requests" },
  { id: 4, title: "تنظیمات ویجت", icon: Settings, href: "/dashboard/settings" },
];

export default function QuickAccess({ selectedRole }: QuickAccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-[#0D1B17] border border-[#59D8C3]/20 rounded-xl overflow-hidden"
    >
      {/* هدر */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#59D8C3]" />
          <h3 className="text-lg font-semibold text-white">دسترسی سریع</h3>
        </div>
      </div>

      {/* لیست دسترسی‌ها */}
      <div className="p-5 grid grid-cols-2 gap-4">
        {quickAccessItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Link
                href={item.href}
                className="flex items-center justify-center p-4 rounded-xl bg-[#12251F] hover:bg-[#1A352B] transition-all duration-300 group border border-transparent hover:border-[#59D8C3]/30"
              >
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-[#59D8C3]/10 flex items-center justify-center mb-2 group-hover:bg-[#59D8C3]/20 transition-colors">
                    <Icon className="w-5 h-5 text-[#59D8C3]" />
                  </div>
                  <span className="text-white text-sm font-medium group-hover:text-[#59D8C3] transition-colors">
                    {item.title}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}