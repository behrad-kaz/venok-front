// components/dashboard/reports/TicketStatusChart.tsx
"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface TicketStatusChartProps {
  dateRange: "today" | "week" | "month" | "quarter";
  isManager?: boolean;
  managerDepartment?: string;
}

// داده‌های عمومی
const statusDataGlobal = {
  today: { unanswered: 2, pending: 4, answered: 3, closed: 8 },
  week: { unanswered: 9, pending: 16, answered: 24, closed: 62 },
  month: { unanswered: 16, pending: 24, answered: 31, closed: 128 },
  quarter: { unanswered: 42, pending: 58, answered: 89, closed: 380 },
};

// داده‌های دپارتمان حسابداری
const statusDataAccounting = {
  today: { unanswered: 3, pending: 5, answered: 2, closed: 6 },
  week: { unanswered: 14, pending: 22, answered: 12, closed: 38 },
  month: { unanswered: 32, pending: 48, answered: 28, closed: 86 },
  quarter: { unanswered: 85, pending: 132, answered: 76, closed: 245 },
};

// داده‌های دپارتمان سفرهای داخلی
const statusDataDomestic = {
  today: { unanswered: 4, pending: 6, answered: 3, closed: 8 },
  week: { unanswered: 18, pending: 28, answered: 14, closed: 42 },
  month: { unanswered: 42, pending: 58, answered: 32, closed: 98 },
  quarter: { unanswered: 110, pending: 160, answered: 88, closed: 280 },
};

const getStatusData = (isManager: boolean, department?: string, dateRange?: string) => {
  if (!isManager) return statusDataGlobal[dateRange as keyof typeof statusDataGlobal];
  
  switch (department) {
    case "حسابداری":
      return statusDataAccounting[dateRange as keyof typeof statusDataAccounting];
    case "سفرهای داخلی":
      return statusDataDomestic[dateRange as keyof typeof statusDataDomestic];
    default:
      return statusDataGlobal[dateRange as keyof typeof statusDataGlobal];
  }
};

const statusColors = {
  unanswered: { bg: "#F2B84B", label: "پاسخ داده نشده" },
  pending: { bg: "#59D8C3", label: "در حال پیگیری" },
  answered: { bg: "#5BE0A8", label: "پاسخ داده شده" },
  closed: { bg: "#6F8880", label: "بسته شده" },
};

export default function TicketStatusChart({ dateRange, isManager, managerDepartment }: TicketStatusChartProps) {
  const [hoveredSector, setHoveredSector] = useState<any>(null);
  const data = getStatusData(isManager || false, managerDepartment, dateRange);
  const total = Object.values(data).reduce((a, b) => a + b, 0);

  let currentAngle = 0;
  const sectors = Object.entries(data).map(([key, value]) => {
    const angle = (value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { 
      key, 
      value, 
      startAngle, 
      angle, 
      ...statusColors[key as keyof typeof statusColors] 
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-4"
    >
      <h3 className="text-sm font-semibold text-white mb-2">وضعیت تیکت‌ها</h3>
      
      <div className="flex items-center justify-center mb-2 relative">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {sectors.map((sector) => {
              const start = sector.startAngle;
              const end = sector.startAngle + sector.angle;
              const x1 = 50 + 40 * Math.cos((start * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((start * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos((end * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin((end * Math.PI) / 180);
              const largeArc = sector.angle > 180 ? 1 : 0;

              return (
                <path
                  key={sector.key}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={sector.bg}
                  className="cursor-pointer transition-all duration-300 hover:opacity-80 hover:scale-[1.02] origin-center"
                  onMouseEnter={() => setHoveredSector(sector)}
                  onMouseLeave={() => setHoveredSector(null)}
                />
              );
            })}
            <circle cx="50" cy="50" r="28" fill="#0D1B17" />
          </svg>

          {hoveredSector && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-[#06110F]/90 backdrop-blur-sm border border-[#59D8C3]/50 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                <span className="text-[10px] text-white">{hoveredSector.label}:</span>
                <span className="text-sm font-bold text-[#59D8C3]">{hoveredSector.value}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1">
        {sectors.map((sector) => (
          <div key={sector.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sector.bg }} />
              <span className="text-[11px] text-gray-400">{sector.label}</span>
            </div>
            <span className="text-[11px] font-bold text-white">{sector.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}