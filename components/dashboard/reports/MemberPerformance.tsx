// components/dashboard/reports/MemberPerformance.tsx
"use client";

import { motion } from "framer-motion";

interface MemberPerformanceProps {
  dateRange: "today" | "week" | "month" | "quarter";
}

const memberData = {
  today: [
    { name: "امیر حسینی", closed: 5, avgTime: 4, percentage: 85 },
    { name: "الهام کاظمی", closed: 3, avgTime: 6, percentage: 75 },
    { name: "نیلوفر کریمی", closed: 4, avgTime: 5, percentage: 80 },
    { name: "رضا نادری", closed: 2, avgTime: 7, percentage: 70 },
    { name: "سارا محمدی", closed: 4, avgTime: 4, percentage: 82 },
  ],
  week: [
    { name: "امیر حسینی", closed: 28, avgTime: 6, percentage: 94 },
    { name: "الهام کاظمی", closed: 19, avgTime: 9, percentage: 88 },
    { name: "نیلوفر کریمی", closed: 31, avgTime: 7, percentage: 96 },
    { name: "رضا نادری", closed: 22, avgTime: 11, percentage: 91 },
    { name: "سارا محمدی", closed: 28, avgTime: 8, percentage: 93 },
  ],
  month: [
    { name: "امیر حسینی", closed: 112, avgTime: 7, percentage: 92 },
    { name: "الهام کاظمی", closed: 89, avgTime: 10, percentage: 86 },
    { name: "نیلوفر کریمی", closed: 124, avgTime: 8, percentage: 95 },
    { name: "رضا نادری", closed: 95, avgTime: 12, percentage: 89 },
    { name: "سارا محمدی", closed: 108, avgTime: 9, percentage: 91 },
  ],
  quarter: [
    { name: "امیر حسینی", closed: 310, avgTime: 8, percentage: 90 },
    { name: "الهام کاظمی", closed: 245, avgTime: 11, percentage: 85 },
    { name: "نیلوفر کریمی", closed: 335, avgTime: 9, percentage: 93 },
    { name: "رضا نادری", closed: 268, avgTime: 13, percentage: 87 },
    { name: "سارا محمدی", closed: 295, avgTime: 10, percentage: 89 },
  ],
};

const getInitials = (name: string) => {
  const names = name.split(" ");
  if (names.length >= 2) return `${names[0].charAt(0)}${names[1].charAt(0)}`;
  return name.charAt(0);
};

export default function MemberPerformance({ dateRange }: MemberPerformanceProps) {
  const data = memberData[dateRange];
  const maxClosed = Math.max(...data.map(m => m.closed));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-5"
    >
      <h3 className="text-sm font-semibold text-white mb-4">عملکرد اعضا</h3>
      <div className="space-y-3">
        {data.map((member, index) => {
          const percentage = (member.closed / maxClosed) * 100;
          return (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-[#59D8C3]/10 flex items-center justify-center text-xs font-bold text-[#59D8C3] flex-shrink-0">
                {getInitials(member.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-white truncate">{member.name}</span>
                  <span className="text-xs text-gray-500">{member.closed} بسته</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#5BE0A8] flex-shrink-0">{Math.round(percentage)}%</span>
                </div>
              </div>
              <span className="text-[10px] text-gray-500 flex-shrink-0">{member.avgTime} دقیقه</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}