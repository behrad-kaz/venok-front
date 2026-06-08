// components/dashboard/reports/StatusDistributionChart.tsx
"use client";

import { statusDistribution } from "./data";

export default function StatusDistributionChart() {
  return (
    <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-white">توزیع وضعیت گفتگوها</h3>
      </div>
      <div className="space-y-4">
        <div className="w-full h-12 rounded-3xl overflow-hidden flex">
          {Object.entries(statusDistribution).map(([key, data]) => (
            <div
              key={key}
              className="flex items-center justify-center text-xs font-bold text-white transition-all hover:opacity-80"
              style={{ width: `${data.percentage}%`, backgroundColor: data.color }}
              title={`${data.label}: ${data.count}`}
            >
               {data.percentage}%
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(statusDistribution).map(([key, data]) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                <span className="text-xs text-gray-500">{data.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{data.count}</span>
                <span className="text-xs text-gray-500">({data.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}