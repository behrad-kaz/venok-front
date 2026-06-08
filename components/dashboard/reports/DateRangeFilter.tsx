// components/dashboard/reports/DateRangeFilter.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, Download } from "lucide-react";

interface DateRangeFilterProps {
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onExport: () => void;
  departments: { id: number; name: string }[];
}

const rangeOptions = [
  { id: "today", label: "امروز" },
  { id: "week", label: "۷ روز اخیر" },
  { id: "month", label: "۳۰ روز اخیر" },
  { id: "custom", label: "بازه دلخواه" },
];

const statusOptions = [
  { id: "all", label: "همه وضعیت‌ها" },
  { id: "open", label: "باز" },
  { id: "waiting", label: "در انتظار پاسخ" },
  { id: "answered", label: "پاسخ داده‌شده" },
  { id: "closed", label: "بسته‌شده" },
];

export default function DateRangeFilter({
  dateRange,
  onDateRangeChange,
  selectedDepartment,
  onDepartmentChange,
  selectedStatus,
  onStatusChange,
  onExport,
  departments,
}: DateRangeFilterProps) {
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const rangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rangeRef.current && !rangeRef.current.contains(event.target as Node)) {
        setIsRangeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-4 flex-wrap">
        {/* دکمه بازه زمانی */}
        <div className="flex items-center gap-2 relative" ref={rangeRef}>
          <button
            onClick={() => setIsRangeOpen(!isRangeOpen)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border bg-[#0D1B17] border-[rgba(255,255,255,0.1)] text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
          >
            <Calendar className="w-3 h-3 inline ml-1" />
            {rangeOptions.find(r => r.id === dateRange)?.label || "امروز"}
            <ChevronDown className={`w-3 h-3 inline mr-1 transition-transform ${isRangeOpen ? "rotate-180" : ""}`} />
          </button>
          {isRangeOpen && (
            <div className="absolute top-full right-0 mt-2 w-32 rounded-xl bg-[#0D1B17] border border-[rgba(255,255,255,0.1)] shadow-xl overflow-hidden z-50">
              {rangeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onDateRangeChange(option.id);
                    setIsRangeOpen(false);
                  }}
                  className={`w-full text-right px-4 py-2.5 text-sm transition-all ${
                    dateRange === option.id
                      ? "bg-[rgba(89,216,195,0.1)] text-[#59D8C3]"
                      : "text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.03)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* انتخاب دپارتمان */}
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0D1B17] border border-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:border-[#59D8C3] transition-all cursor-pointer"
          style={{ backgroundColor: "#0D1B17" }}
        >
          <option value="all" className="bg-[#0D1B17] text-white">همه دپارتمان‌ها</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id} className="bg-[#0D1B17] text-white">
              {dept.name}
            </option>
          ))}
        </select>

        {/* انتخاب وضعیت */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0D1B17] border border-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:border-[#59D8C3] transition-all cursor-pointer"
          style={{ backgroundColor: "#0D1B17" }}
        >
          {statusOptions.map((option) => (
            <option key={option.id} value={option.id} className="bg-[#0D1B17] text-white">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* دکمه خروجی گرفتن */}
      <button
        onClick={onExport}
        className="px-4 py-2 rounded-xl text-xs font-medium bg-[#0D1B17] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        <span>خروجی گرفتن</span>
      </button>
    </div>
  );
}