// components/dashboard/manager/DateRangeFilter.tsx
"use client";

import { useState } from "react";

interface DateRangeFilterProps {
  dateRange: string;
  onDateRangeChange: (range: string) => void;
}

const rangeOptions = [
  { id: "today", label: "امروز" },
  { id: "week", label: "۷ روز اخیر" },
  { id: "month", label: "۳۰ روز اخیر" },
];

export default function DateRangeFilter({ dateRange, onDateRangeChange }: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      {rangeOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => onDateRangeChange(option.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            dateRange === option.id
              ? "bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F]"
              : "bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}