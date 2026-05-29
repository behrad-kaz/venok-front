// components/dashboard/reports/DateFilter.tsx
"use client";

interface DateFilterProps {
  value: "today" | "week" | "month" | "quarter";
  onChange: (value: "today" | "week" | "month" | "quarter") => void;
}

const filterOptions = [
  { id: "today", label: "امروز" },
  { id: "week", label: "۷ روز اخیر" },
  { id: "month", label: "۳۰ روز اخیر" },
  { id: "quarter", label: "۳ ماه اخیر" },
];

export default function DateFilter({ value, onChange }: DateFilterProps) {
  return (
    <div className="flex items-center gap-2">
      {filterOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id as any)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            value === option.id
              ? "bg-[#59D8C3]/10 border-[#59D8C3]/30 text-[#59D8C3]"
              : "border-[#59D8C3]/20 text-gray-400 hover:border-[#59D8C3]/40 hover:text-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}