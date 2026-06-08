"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface ConversationTrendProps {
  data: {
    day: string;
    new: number;
    solved: number;
  }[];
}

export default function ConversationTrend({ data }: ConversationTrendProps) {
  const [hoveredBar, setHoveredBar] = useState<{ day: string; type: string; value: number } | null>(null);

  const maxValue = 20;
  const getBarHeight = (value: number) => (value / maxValue) * 100;

  return (
    <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
      <h3 className="text-sm font-bold text-white mb-4">روند گفتگوهای دپارتمان</h3>

      <div className="relative">
        <div className="h-48 flex items-end justify-between gap-2">
          {data.map((item, idx) => (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-1 h-32">
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
                {/* نوار گفتگوهای حل‌شده */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${getBarHeight(item.solved)}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  onMouseEnter={() => setHoveredBar({ day: item.day, type: "حل‌شده", value: item.solved })}
                  onMouseLeave={() => setHoveredBar(null)}
                  className="w-full rounded-t-lg bg-[rgba(91,224,168,0.3)] border-t-2 border-[#5BE0A8] transition-all hover:bg-[rgba(91,224,168,0.4)] cursor-pointer"
                  style={{ height: `${getBarHeight(item.solved)}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500">{item.day}</span>
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hoveredBar && (
          <div
            className="absolute bg-[#0D1B17] border border-[#59D8C3]/30 rounded-lg px-3 py-1.5 shadow-lg z-50 text-center"
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
          <div className="w-3 h-3 rounded bg-[#5BE0A8]" />
          <span className="text-xs text-gray-500">گفتگوهای حل‌شده</span>
        </div>
      </div>
    </div>
  );
}