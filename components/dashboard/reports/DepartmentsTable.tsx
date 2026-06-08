// components/dashboard/reports/DepartmentsTable.tsx
"use client";

import Link from "next/link";
import { DepartmentPerformance } from "./types";

interface DepartmentsTableProps {
  departments: DepartmentPerformance[];
}

const getStatusBadge = (status: DepartmentPerformance["status"]) => {
  switch (status) {
    case "good":
      return { text: "خوب", color: "bg-[rgba(91,224,168,0.12)] text-[#5be0a8] border-[rgba(91,224,168,0.28)]" };
    case "normal":
      return { text: "عادی", color: "bg-[rgba(111,136,128,0.12)] text-gray-400 border-[rgba(111,136,128,0.22)]" };
    case "attention":
      return { text: "نیازمند توجه", color: "bg-[rgba(242,184,75,0.12)] text-[#f2b84b] border-[rgba(242,184,75,0.28)]" };
  }
};

export default function DepartmentsTable({ departments }: DepartmentsTableProps) {
  return (
    <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-white">عملکرد دپارتمان‌ها</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.1)]">
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">دپارتمان</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">کل گفتگوها</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">گفتگوهای باز</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">میانگین اولین پاسخ</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">نرخ حل‌شدن</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">وضعیت عملکرد</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => {
              const badge = getStatusBadge(dept.status);
              return (
                <tr key={dept.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <td className="py-3 px-4"><span className="text-white font-medium">{dept.name}</span></td>
                  <td className="py-3 px-4"><span className="text-white">{dept.totalTickets}</span></td>
                  <td className="py-3 px-4"><span className="text-white">{dept.openTickets}</span></td>
                  <td className="py-3 px-4"><span className="text-white">{dept.avgFirstResponse}</span></td>
                  <td className="py-3 px-4"><span className="text-white">{dept.resolutionRate}%</span></td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs ${badge.color}`}>
                      {badge.text}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/dashboard/departments`} className="text-xs font-medium text-[#59D8C3] hover:text-[#6ef3dc] transition-colors">
                      مشاهده جزئیات
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}