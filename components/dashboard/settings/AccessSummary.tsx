// components/dashboard/settings/AccessSummary.tsx
"use client";

interface AccessSummaryProps {
  counts: {
    admin: number;
    manager: number;
    staff: number;
  };
}

export default function AccessSummary({ counts }: AccessSummaryProps) {
  const items = [
    { label: "مدیر کل", count: counts.admin, color: "#59D8C3", bg: "rgba(89,216,195,0.08)" },
    { label: "مدیر دپارتمان", count: counts.manager, color: "#5BE0A8", bg: "rgba(91,224,168,0.08)" },
    { label: "کارمند پشتیبانی", count: counts.staff, color: "#6B7280", bg: "rgba(167,189,182,0.06)" },
  ];

  return (
    <div className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">خلاصه دسترسی‌ها</h3>
        <p className="text-xs text-gray-500 mt-0.5">وضعیت کنونی اعضای ورک‌اسپیس</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl p-3 text-center border border-[#59D8C3]/20" style={{ backgroundColor: item.bg }}>
            <p className="text-xl font-bold" style={{ color: item.color }}>{item.count}</p>
            <p className="text-[10px] text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}