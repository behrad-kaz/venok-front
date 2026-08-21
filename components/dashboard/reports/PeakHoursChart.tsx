// components/dashboard/reports/PeakHoursChart.tsx
"use client";

import { useReportsData } from "./hooks/useReportsData";

const getIntensityColor = (intensity: string) => {
  if (intensity === "high") return "bg-[#59D8C3]";
  if (intensity === "medium") return "bg-[rgba(89,216,195,0.6)]";
  return "bg-[rgba(89,216,195,0.3)]";
};

interface PeakHoursChartProps {
  data?: { hour: string; value: number; intensity: string }[];
}

export default function PeakHoursChart({ data: propData }: PeakHoursChartProps) {
  const { peakHours: hookData, isLoading } = useReportsData();
  const data = propData || hookData;

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
        <div className="h-6 bg-[rgba(255,255,255,0.05)] rounded w-48 mb-5 animate-pulse" />
        <div className="h-32 bg-[rgba(255,255,255,0.03)] rounded animate-pulse" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
        <h3 className="text-base font-bold text-white mb-5">ساعات پرترافیک</h3>
        <div className="h-32 flex items-center justify-center">
          <p className="text-xs text-gray-500">داده‌ای برای نمایش وجود ندارد</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(h => h.value), 1);

  return (
    <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-white">ساعات پرترافیک</h3>
      </div>
      <div className="flex items-end justify-between gap-1 h-32">
        {data.map((hour) => (
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
