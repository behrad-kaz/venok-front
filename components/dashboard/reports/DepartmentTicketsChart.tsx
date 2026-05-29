// components/dashboard/reports/DepartmentTicketsChart.tsx
"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

interface DepartmentTicketsChartProps {
  dateRange: "today" | "week" | "month" | "quarter";
}

type DepartmentKey = "accounting" | "domestic" | "international" | "technical";

const departmentData: Record<
  DepartmentTicketsChartProps["dateRange"],
  Record<DepartmentKey, number>
> = {
  today: {
    accounting: 8,
    domestic: 12,
    international: 6,
    technical: 4,
  },
  week: {
    accounting: 42,
    domestic: 58,
    international: 34,
    technical: 22,
  },
  month: {
    accounting: 58,
    domestic: 86,
    international: 52,
    technical: 35,
  },
  quarter: {
    accounting: 165,
    domestic: 248,
    international: 145,
    technical: 98,
  },
};

const departments: Array<{
  id: DepartmentKey;
  label: string;
  color: string;
}> = [
  { id: "accounting", label: "حسابداری", color: "#5BE0A8" },
  { id: "domestic", label: "سفرهای داخلی", color: "#59D8C3" },
  { id: "international", label: "سفرهای خارجی", color: "#4CAF50" },
  { id: "technical", label: "پشتیبانی فنی", color: "#FF9800" },
];

export default function DepartmentTicketsChart({
  dateRange,
}: DepartmentTicketsChartProps) {
  const [hoveredDepartment, setHoveredDepartment] = useState<{
    id: DepartmentKey;
    label: string;
    color: string;
    value: number;
  } | null>(null);

  const data = departmentData[dateRange];

  const maxValue = useMemo(() => {
    return Math.max(...Object.values(data));
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-5 overflow-visible"
    >
      <h3 className="text-sm font-semibold text-white mb-5">
        تیکت بر اساس دپارتمان
      </h3>

      <div className="space-y-4">
        {departments.map((dept) => {
          const value = data[dept.id];
          const percentage = (value / maxValue) * 100;

          return (
            <div key={dept.id} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{dept.label}</span>
                <span className="text-xs text-white">{value}</span>
              </div>

              {/* ناحیه‌ی خودِ بار */}
              <div className="relative h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: percentage / 100 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full origin-left rounded-full cursor-pointer"
                  style={{ backgroundColor: dept.color }}
                  onMouseEnter={() =>
                    setHoveredDepartment({
                      id: dept.id,
                      label: dept.label,
                      color: dept.color,
                      value,
                    })
                  }
                  onMouseLeave={() => setHoveredDepartment(null)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {hoveredDepartment && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="min-w-[120px] rounded-2xl border border-[#59D8C3]/40 bg-[#06110F]/90 backdrop-blur-md shadow-2xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: hoveredDepartment.color }}
              />
              <span className="text-xs text-white/90">
                {hoveredDepartment.label}
              </span>
            </div>

            <div className="flex items-center  gap-4">
              <span className="text-[11px] text-white/55">تیکت:</span>
              <span className="text-sm font-bold text-[#59D8C3]">
                {hoveredDepartment.value}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
