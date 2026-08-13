// components/dashboard/admin/DepartmentsTable.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { memo } from "react";

interface Department {
  id: number;
  name: string;
  openConversations: number;
  activeMembers: number;
  avgResponseTime: string;
  status: "busy" | "normal";
}

const departments: Department[] = [
  { id: 1, name: "پشتیبانی", openConversations: 12, activeMembers: 2, avgResponseTime: "۱۵ دقیقه", status: "busy" },
  { id: 2, name: "فروش", openConversations: 5, activeMembers: 3, avgResponseTime: "۸ دقیقه", status: "normal" },
  { id: 3, name: "مالی", openConversations: 4, activeMembers: 1, avgResponseTime: "۲۰ دقیقه", status: "normal" },
  { id: 4, name: "پیگیری سفارش", openConversations: 3, activeMembers: 2, avgResponseTime: "۱۰ دقیقه", status: "normal" },
];

function DepartmentsTableComponent() {
  return (
    <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] overflow-hidden">
      <div className="p-5 border-b border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">وضعیت دپارتمان‌ها</h3>
          <Link
            href="/dashboard/departments"
            className="text-xs text-gray-500 hover:text-[#59D8C3] transition-colors"
          >
            مشاهده همه
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-[rgba(255,255,255,0.1)]">
            <tr>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">دپارتمان</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">گفتگوهای باز</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">اعضای فعال</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">میانگین پاسخ</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">وضعیت</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, index) => (
              <motion.tr
                key={dept.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="border-b border-[rgba(255,255,255,0.05)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
              >
                <td className="px-4 py-3.5">
                  <span className="text-sm font-medium text-white">{dept.name}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-white">{dept.openConversations}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5BE0A8]" />
                    <span className="text-sm text-white">{dept.activeMembers}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-gray-500">{dept.avgResponseTime}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      dept.status === "busy"
                        ? "text-[#F2B84B] bg-[rgba(242,184,75,0.1)] border-[rgba(242,184,75,0.2)]"
                        : "text-[#5BE0A8] bg-[rgba(91,224,168,0.1)] border-[rgba(91,224,168,0.2)]"
                    }`}
                  >
                    {dept.status === "busy" ? "شلوغ" : "عادی"}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <Link
                    href={`/dashboard/departments/${dept.id}`}
                    className="text-xs text-[#59D8C3] hover:text-[#6ef3dc] font-medium transition-colors"
                  >
                    مشاهده
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ✅ استفاده از memo برای جلوگیری از رندر مجدد
export default memo(DepartmentsTableComponent);