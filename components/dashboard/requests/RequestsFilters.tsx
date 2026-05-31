// components/dashboard/requests/RequestsFilters.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, Calendar, Filter, XCircle } from "lucide-react";

interface RequestsFiltersProps {
  selectedRole?: string;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: string) => void;
  onTimeRangeChange: (range: string) => void;
  onDepartmentChange: (dept: string) => void;
  activeStatus: string;
  selectedTimeRange: string;
  selectedDepartment: string;
  ticketsCount: {
    all: number;
    unanswered: number;
    pending: number;
    answered: number;
    closed: number;
  };
}

const statusFilters = [
  { id: "all", label: "همه" },
  { id: "unanswered", label: "بی پاسخ" },
  { id: "pending", label: "در حال پیگیری" },
  { id: "answered", label: "پاسخ داده شده" },
  { id: "closed", label: "بسته شده" },
];

const timeRanges = [
  { id: "all", label: "همه زمان‌ها" },
  { id: "today", label: "امروز" },
  { id: "yesterday", label: "دیروز" },
  { id: "last3days", label: "۳ روز پیش" },
  { id: "last7days", label: "۷ روز پیش" },
  { id: "lastMonth", label: "ماه پیش" },
];

const departments = [
  { id: "all", label: "همه دپارتمان‌ها" },
  { id: "حسابداری", label: "حسابداری" },
  { id: "سفرهای داخلی", label: "سفرهای داخلی" },
  { id: "سفرهای خارجی", label: "سفرهای خارجی" },
  { id: "پشتیبانی فنی", label: "پشتیبانی فنی" },
];

export default function RequestsFilters({
  selectedRole,
  onSearchChange,
  onStatusChange,
  onTimeRangeChange,
  onDepartmentChange,
  activeStatus,
  selectedTimeRange,
  selectedDepartment,
  ticketsCount,
}: RequestsFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isTimeMenuOpen, setIsTimeMenuOpen] = useState(false);
  const [isDeptMenuOpen, setIsDeptMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, onSearchChange]);

  const clearSearch = () => {
    setSearchQuery("");
    onSearchChange("");
  };

  return (
    <div className="space-y-4">
      {/* ردیف اول: سرچ و فیلترهای اصلی */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* سرچ ایندپوت */}
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="جستجو بر اساس شماره تیکت، نام مشتری، شماره موبایل یا موضوع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#12251F] border border-[#59D8C3]/20 rounded-lg py-2.5 pr-10 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors text-sm"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* فیلتر زمان */}
        <div className="relative">
          <button
            onClick={() => setIsTimeMenuOpen(!isTimeMenuOpen)}
            className="flex items-center gap-2 bg-[#12251F] border border-[#59D8C3]/20 rounded-lg px-4 py-2.5 text-sm text-white hover:border-[#59D8C3] transition-colors"
          >
            <Calendar className="w-4 h-4 text-[#59D8C3]" />
            <span>{timeRanges.find((t) => t.id === selectedTimeRange)?.label}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isTimeMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isTimeMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-44 bg-[#0D1B17] border border-[#59D8C3]/20 rounded-lg overflow-hidden shadow-xl z-50">
              {timeRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => {
                    onTimeRangeChange(range.id);
                    setIsTimeMenuOpen(false);
                  }}
                  className={`w-full text-right px-4 py-2 text-sm transition-colors ${
                    selectedTimeRange === range.id
                      ? "bg-gradient-to-r from-[#59D8C3]/20 to-[#5BE0A8]/20 text-[#59D8C3]"
                      : "text-gray-300 hover:bg-[#12251F]"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* فیلتر دپارتمان - فقط برای نقش‌های غیر کارمند نمایش داده شود */}
        {selectedRole !== "کارمند" && (
          <div className="relative">
            <button
              onClick={() => setIsDeptMenuOpen(!isDeptMenuOpen)}
              className="flex items-center gap-2 bg-[#12251F] border border-[#59D8C3]/20 rounded-lg px-4 py-2.5 text-sm text-white hover:border-[#59D8C3] transition-colors"
            >
              <Filter className="w-4 h-4 text-[#59D8C3]" />
              <span className="max-w-[120px] truncate">
                {departments.find((d) => d.id === selectedDepartment)?.label}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isDeptMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDeptMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-[#0D1B17] border border-[#59D8C3]/20 rounded-lg overflow-hidden shadow-xl z-50">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => {
                      onDepartmentChange(dept.id);
                      setIsDeptMenuOpen(false);
                    }}
                    className={`w-full text-right px-4 py-2 text-sm transition-colors ${
                      selectedDepartment === dept.id
                        ? "bg-gradient-to-r from-[#59D8C3]/20 to-[#5BE0A8]/20 text-[#59D8C3]"
                        : "text-gray-300 hover:bg-[#12251F]"
                    }`}
                  >
                    {dept.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* دکمه‌های فیلتر وضعیت */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((status) => (
          <button
            key={status.id}
            onClick={() => onStatusChange(status.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeStatus === status.id
                ? "bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] shadow-md"
                : "bg-[#12251F] text-gray-400 hover:text-white hover:bg-[#1A352B]"
            }`}
          >
            {status.label}
            <span
              className={`mr-2 px-1.5 py-0.5 rounded-full text-xs ${
                activeStatus === status.id
                  ? "bg-[#06110F]/20 text-[#06110F]"
                  : "bg-[#0D1B17] text-gray-400"
              }`}
            >
              {ticketsCount[status.id as keyof typeof ticketsCount]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}