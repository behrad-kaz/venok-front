"use client";

import { useReportsData } from "./hooks/useReportsData";

interface DepartmentStatusDistributionProps {
  data?: {
    open: { label: string; count: number; percentage: number; color: string };
    waiting: { label: string; count: number; percentage: number; color: string };
    answered: { label: string; count: number; percentage: number; color: string };
    closed: { label: string; count: number; percentage: number; color: string };
  } | null;
}

export default function DepartmentStatusDistribution({ data: propData }: DepartmentStatusDistributionProps) {
  const { statusDistribution: hookData, isLoading } = useReportsData();
  const data = propData || hookData;

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
        <div className="h-6 bg-[rgba(255,255,255,0.05)] rounded w-48 mb-5 animate-pulse" />
        <div className="space-y-3">
          <div className="h-12 bg-[rgba(255,255,255,0.03)] rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-[rgba(255,255,255,0.03)] rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
        <h3 className="text-sm font-bold text-white mb-4">وضعیت گفتگوهای دپارتمان</h3>
        <div className="h-48 flex items-center justify-center">
          <p className="text-xs text-gray-500">داده‌ای برای نمایش وجود ندارد</p>
        </div>
      </div>
    );
  }

  const items = Object.values(data);

  return (
    <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
      <h3 className="text-sm font-bold text-white mb-4">وضعیت گفتگوهای دپارتمان</h3>

      <div className="space-y-4">
        <div className="w-full h-12 rounded-xl overflow-hidden flex">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-center text-xs font-bold text-white transition-all hover:opacity-80"
              style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
              title={`${item.label}: ${item.count}`}
            >
               {item.percentage}%
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-500">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{item.count}</span>
                <span className="text-xs text-gray-500">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
