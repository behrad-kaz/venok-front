// components/dashboard/DepartmentPerformance.tsx
"use client";

import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

interface DepartmentPerformanceProps {
  selectedRole?: string;
}

const departments = [
  { id: 1, name: "حسابداری", tickets: 100 },
  { id: 2, name: "سفرهای داخلی", tickets: 94 },
  { id: 3, name: "سفرهای خارجی", tickets: 67 },
  { id: 4, name: "پشتیبانی فنی", tickets: 45 },
];

export default function DepartmentPerformance({ selectedRole }: DepartmentPerformanceProps) {
  const maxTickets = Math.max(...departments.map(d => d.tickets));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-[#0D1B17] border border-[#59D8C3]/20 mt-4 rounded-xl overflow-hidden"
    >
      {/* هدر */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#59D8C3]" />
          <h3 className="text-lg font-semibold text-white">عملکرد دپارتمان‌ها</h3>
        </div>
      </div>

      {/* لیست دپارتمان‌ها */}
      <div className="p-5 space-y-4">
        {departments.map((dept, index) => (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="space-y-2"
          >
            {/* ردیف نام و تعداد */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium">{dept.name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <span className="text-xs font-bold">{dept.tickets}</span>
                <span className="text-xs">تیکت</span>
              </div>
            </div>

            {/* نوار پیشرفت */}
            <div className="relative w-full h-2 bg-[#12251F] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(dept.tickets / maxTickets) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                className="absolute top-0 right-0 h-full rounded-full bg-[#59D8C3]"
                style={{ width: `${(dept.tickets / maxTickets) * 100}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}