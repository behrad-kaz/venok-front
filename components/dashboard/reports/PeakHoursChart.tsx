// components/dashboard/reports/PeakHoursChart.tsx
"use client";

import { peakHours } from "./data";

const getIntensityColor = (intensity: string) => {
  if (intensity === "high") return "bg-[#59D8C3]";
  if (intensity === "medium") return "bg-[rgba(89,216,195,0.6)]";
  return "bg-[rgba(89,216,195,0.3)]";
};

export default function PeakHoursChart() {
  const maxValue = Math.max(...peakHours.map(h => h.value));

  return (
    <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-white">ساعات پرترافیک</h3>
      </div>
      <div className="flex items-end justify-between gap-1 h-32">
        {peakHours.map((hour) => (
          <div key={hour.hour} className="flex-1 flex flex-col items-center gap-2">
            <div className="flex-1 w-full flex flex-col justify-end">
              <div
                className={`w-full rounded-t-lg transition-all hover:opacity-80 ${getIntensityColor(hour.intensity)}`}
                style={{ height: `${(hour.value / maxValue) * 100}%` }}
                title={`${hour.hour}: ${hour.value} گفتگو`}
              />
            </div>
            <span className="text-[10px] text-gray-500 whitespace-nowrap">{hour.hour}</span>
          </div>
        ))}
      </div>
    </div>
  );
}