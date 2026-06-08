// components/dashboard/reports/TopTopics.tsx
"use client";

import { ChevronRight, Minus, TrendingDown, TrendingUp } from "lucide-react";

interface TopTopicsProps {
  topics: { id: number; title: string; count: number; percentage: number; trend: string }[];
}

const getTrendIcon = (trend: string) => {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-[#59D8C3]" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-gray-500" />;
};

export default function TopTopics({ topics }: TopTopicsProps) {
  return (
    <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-white">موضوعات پرتکرار</h3>
      </div>
      <div className="space-y-3">
        {topics.map((topic) => (
          <div key={topic.id} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(89,216,195,0.3)] transition-all">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[rgba(89,216,195,0.08)] border border-[rgba(89,216,195,0.15)] flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-[#59D8C3]">{topic.id}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{topic.title}</p>
                <p className="text-xs text-gray-500">{topic.count} گفتگو · {topic.percentage}%</p>
              </div>
            </div>
            <div className="flex-shrink-0">{getTrendIcon(topic.trend)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}