// components/dashboard/reports/MembersTable.tsx
"use client";

import Link from "next/link";
import { useReportsData } from "./hooks/useReportsData";
import { MemberPerformance } from "./types";

interface MembersTableProps {
  members?: MemberPerformance[];
}

export default function MembersTable({ members: propMembers }: MembersTableProps) {
  const { members: hookMembers, isLoading } = useReportsData();
  const members = propMembers || hookMembers;

  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
        <div className="h-6 bg-[rgba(255,255,255,0.05)] rounded w-48 mb-5 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-[rgba(255,255,255,0.03)] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-white">عملکرد اعضا</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.1)]">
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">عضو</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">دپارتمان</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">گفتگوهای پاسخ‌داده‌شده</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">میانگین زمان پاسخ</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">گفتگوهای باز</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">آخرین فعالیت</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-xl inline-flex items-center justify-center font-semibold bg-[rgba(89,216,195,0.14)] text-[#59D8C3] border border-[rgba(89,216,195,0.2)] w-7 h-7 text-[10px]">
                      {member.initials}
                    </span>
                    <span className="text-white font-medium">{member.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4"><span className="text-gray-500">{member.department}</span></td>
                <td className="py-3 px-4"><span className="text-white">{member.answeredTickets}</span></td>
                <td className="py-3 px-4"><span className="text-white">{member.avgResponseTime}</span></td>
                <td className="py-3 px-4"><span className="text-white">{member.openTickets}</span></td>
                <td className="py-3 px-4"><span className="text-gray-500">{member.lastActivity}</span></td>
                <td className="py-3 px-4">
                  <Link href={`/dashboard/conversations?member=${member.id}`} className="text-xs font-medium text-[#59D8C3] hover:text-[#6ef3dc] transition-colors">
                    مشاهده گفتگوها
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
