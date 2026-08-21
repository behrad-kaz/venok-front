"use client";

import { useReportsData } from "./hooks/useReportsData";
import { CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";

export default function DepartmentResponseStatus() {
  const { trendData, statusDistribution, isLoading } = useReportsData();

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
        <div className="h-6 bg-[rgba(255,255,255,0.05)] rounded w-48 mb-5 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-[rgba(255,255,255,0.03)] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const todayData = trendData[trendData.length - 1];
  const todayNew = todayData?.new || 0;
  const todayOpen = todayData?.open || 0;
  const todayClosed = todayData?.closed || 0;

  const waitingCount = statusDistribution?.waiting.count || 0;
  const unassignedCount = statusDistribution?.open.count || 0;

  const items = [
    {
      id: 1,
      title: "گفتگوهای پاسخ‌داده‌شده زیر ۵ دقیقه",
      subtitle: "عملکرد خوب",
      value: "۸۲٪",
      icon: CheckCircle,
      iconColor: "#59D8C3",
      bgColor: "rgba(89,216,195,0.08)",
      borderColor: "rgba(89,216,195,0.15)",
    },
    {
      id: 2,
      title: "گفتگوهای دیر پاسخ‌داده‌شده",
      subtitle: "بیشتر از ۱۵ دقیقه",
      value: String(Math.max(0, waitingCount - 2)),
      icon: Clock,
      iconColor: "#F2B84B",
      bgColor: "rgba(242,184,75,0.08)",
      borderColor: "rgba(242,184,75,0.15)",
    },
    {
      id: 3,
      title: "گفتگوهای بدون مسئول",
      subtitle: "نیاز به تخصیص",
      value: String(unassignedCount),
      icon: AlertTriangle,
      iconColor: "#FF6B6B",
      bgColor: "rgba(255,107,107,0.08)",
      borderColor: "rgba(255,107,107,0.15)",
    },
    {
      id: 4,
      title: "گفتگوهای بسته‌شده امروز",
      subtitle: "عملکرد امروز",
      value: String(todayClosed),
      icon: XCircle,
      iconColor: "#8B7FDF",
      bgColor: "rgba(139,127,223,0.08)",
      borderColor: "rgba(139,127,223,0.15)",
    },
  ];

  return (
    <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-white">وضعیت پاسخ‌گویی</h3>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: item.bgColor, borderColor: item.borderColor }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.iconColor }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.subtitle}</p>
                </div>
              </div>
              <span className="text-xl font-bold" style={{ color: item.iconColor }}>
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
