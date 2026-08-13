"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface DepartmentConversationTrendProps {
  data?: {
    day: string;
    new: number;
    open: number;
    closed: number;
  }[];
}

// داده‌های استاتیک پیش‌فرض
const defaultData = [
  { day: "شنبه", new: 12, open: 8, closed: 4 },
  { day: "یکشنبه", new: 15, open: 10, closed: 5 },
  { day: "دوشنبه", new: 10, open: 7, closed: 3 },
  { day: "سه‌شنبه", new: 18, open: 12, closed: 6 },
  { day: "چهارشنبه", new: 14, open: 9, closed: 5 },
  { day: "پنجشنبه", new: 16, open: 11, closed: 5 },
  { day: "جمعه", new: 20, open: 14, closed: 6 },
];

const maxValue = Math.max(...defaultData.map(d => Math.max(d.new, d.open, d.closed)), 1); 

export default function DepartmentConversationTrend({ data = defaultData }: DepartmentConversationTrendProps) {
  const [hoveredBar, setHoveredBar] = useState<{ day: string; type: string; value: number } | null>(null);

  const getBarHeight = (value: number) => {
    const percentage = (value / maxValue) * 100;
    return Math.min(percentage, 95);
  };

  return (
    <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
      <h3 className="text-sm font-bold text-white mb-4">روند گفتگوهای دپارتمان</h3>

      <div className="relative">
        {/* نمودار - ارتفاع ثابت 200px */}
        <div className="h-52 flex items-end justify-between gap-2">
          {data.map((item, idx) => (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
              {/* محفظه نوارها - ارتفاع ثابت 140px */}
              <div className="w-full h-[140px] flex items-end justify-center gap-1">
                {/* نوار گفتگوهای جدید */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${getBarHeight(item.new)}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  onMouseEnter={() => setHoveredBar({ day: item.day, type: "جدید", value: item.new })}
                  onMouseLeave={() => setHoveredBar(null)}
                  className="w-full rounded-t-lg bg-[rgba(89,216,195,0.3)] border-t-2 border-[#59D8C3] transition-all hover:bg-[rgba(89,216,195,0.4)] cursor-pointer"
                  style={{ height: `${getBarHeight(item.new)}%` }}
                />
                {/* نوار گفتگوهای باز */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${getBarHeight(item.open)}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  onMouseEnter={() => setHoveredBar({ day: item.day, type: "باز", value: item.open })}
                  onMouseLeave={() => setHoveredBar(null)}
                  className="w-full rounded-t-lg bg-[rgba(242,184,75,0.3)] border-t-2 border-[#F2B84B] transition-all hover:bg-[rgba(242,184,75,0.4)] cursor-pointer"
                  style={{ height: `${getBarHeight(item.open)}%` }}
                />
                {/* نوار گفتگوهای بسته */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${getBarHeight(item.closed)}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  onMouseEnter={() => setHoveredBar({ day: item.day, type: "بسته", value: item.closed })}
                  onMouseLeave={() => setHoveredBar(null)}
                  className="w-full rounded-t-lg bg-[rgba(91,224,168,0.3)] border-t-2 border-[#5BE0A8] transition-all hover:bg-[rgba(91,224,168,0.4)] cursor-pointer"
                  style={{ height: `${getBarHeight(item.closed)}%` }}
                />
              </div>
              {/* برچسب روز */}
              <span className="text-[10px] text-gray-500">{item.day}</span>
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hoveredBar && (
          <div
            className="absolute bg-[#0D1B17] border border-[#59D8C3]/30 rounded-lg px-3 py-1.5 shadow-lg z-50 text-center whitespace-nowrap"
            style={{
              left: "50%",
              bottom: "100%",
              transform: "translateX(-50%)",
              marginBottom: "8px",
            }}
          >
            <div className="text-[10px] text-gray-400">{hoveredBar.day}</div>
            <div className="text-xs font-bold text-[#59D8C3]">{hoveredBar.value}</div>
            <div className="text-[9px] text-gray-500">{hoveredBar.type}</div>
          </div>
        )}
      </div>

      {/* راهنما */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#59D8C3]" />
          <span className="text-xs text-gray-500">گفتگوهای جدید</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#F2B84B]" />
          <span className="text-xs text-gray-500">گفتگوهای باز</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#5BE0A8]" />
          <span className="text-xs text-gray-500">گفتگوهای بسته</span>
        </div>
      </div>
    </div>
  );
}