// components/dashboard/reports/WeeklyTicketsChart.tsx
"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface WeeklyTicketsChartProps {
  dateRange: "today" | "week" | "month" | "quarter";
  isManager?: boolean;
  managerDepartment?: string;
}

// داده‌های عمومی
const weeklyDataGlobal = [32, 28, 35, 30, 26, 38, 22];

// داده‌های دپارتمان حسابداری
const weeklyDataAccounting = [19, 15, 22, 18, 14, 25, 12];

// داده‌های دپارتمان سفرهای داخلی
const weeklyDataDomestic = [28, 32, 30, 35, 27, 40, 20];

// داده‌های دپارتمان سفرهای خارجی
const weeklyDataInternational = [24, 20, 28, 22, 18, 30, 16];

// داده‌های دپارتمان پشتیبانی فنی
const weeklyDataTechnical = [12, 10, 14, 11, 9, 15, 8];

const getWeeklyData = (isManager: boolean, department?: string) => {
  if (!isManager) return weeklyDataGlobal;
  
  switch (department) {
    case "حسابداری":
      return weeklyDataAccounting;
    case "سفرهای داخلی":
      return weeklyDataDomestic;
    case "سفرهای خارجی":
      return weeklyDataInternational;
    case "پشتیبانی فنی":
      return weeklyDataTechnical;
    default:
      return weeklyDataAccounting;
  }
};

const days = ["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];

export default function WeeklyTicketsChart({ dateRange, isManager, managerDepartment }: WeeklyTicketsChartProps) {
  const data = getWeeklyData(isManager || false, managerDepartment);
  const [hoveredBar, setHoveredBar] = useState<{ index: number; value: number; day: string } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const maxDataValue = Math.max(...data);
  const maxYAxis = Math.ceil(maxDataValue / 8) * 8;
  const yAxisValues = [];
  for (let i = 0; i <= maxYAxis; i += 8) {
    yAxisValues.push(i);
  }
  
  const getBarHeight = (value: number) => {
    return (value / maxYAxis) * 160;
  };

  const handleMouseMove = (e: React.MouseEvent, index: number, value: number, day: string) => {
    setHoveredBar({ index, value, day });
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-5 pb-18"
    >
      <h3 className="text-sm font-semibold text-white mb-5">
        {isManager ? `تیکت‌های هفتگی - ${managerDepartment}` : "تیکت‌های هفتگی"}
      </h3>

      <div className="grid grid-cols-[1fr_40px] gap-2">
        <div className="relative h-[200px]">
          <div className="absolute inset-0">
            {yAxisValues.map((val) => (
              <div
                key={val}
                className="border-t border-[rgba(99,255,218,0.06)] absolute w-full"
                style={{ bottom: `${(val / maxYAxis) * 100}%` }}
              />
            ))}
          </div>

          <div className="absolute inset-0 flex items-end justify-between gap-10">
            {data.map((value, index) => {
              const barHeight = getBarHeight(value);
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center h-full justify-end relative"
                  onMouseMove={(e) => handleMouseMove(e, index, value, days[index])}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${barHeight}px` }}
                    transition={{ duration: 0.8, delay: 0.3 + index * 0.05 }}
                    className="w-full bg-gradient-to-t from-[#59D8C3] to-[#5BE0A8] rounded-lg cursor-pointer"
                    style={{ maxHeight: "160px", minHeight: "4px" }}
                  />
                  <span className="text-[10px] text-gray-500 mt-2 absolute -bottom-5 whitespace-nowrap">
                    {days[index]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col justify-between h-[200px] text-[11px] text-gray-500 text-left">
          {[...yAxisValues].reverse().map((val) => (
            <div key={val} className="leading-none" style={{ marginTop: val === maxYAxis ? "-4px" : "auto" }}>
              {val}
            </div>
          ))}
        </div>
      </div>

      {hoveredBar && (
        <div
          className="fixed bg-[#0D1B17] border border-[#59D8C3]/30 rounded-lg px-3 py-1.5 shadow-lg z-50"
          style={{
            left: mousePosition.x + 15,
            top: mousePosition.y - 40,
          }}
        >
          <div className="text-center">
            <div className="text-[10px] text-gray-400">{hoveredBar.day}</div>
            <div className="text-sm font-bold text-[#59D8C3]">{hoveredBar.value}</div>
            <div className="text-[9px] text-gray-500">تیکت</div>
          </div>
        </div>
      )}
    </motion.div>
  );
}