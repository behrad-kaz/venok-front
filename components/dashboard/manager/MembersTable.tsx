// components/dashboard/manager/MembersTable.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { DepartmentMember } from "./types";

interface MembersTableProps {
  members: DepartmentMember[];
}

const getWorkStatusBadge = (status: string) => {
  if (status === "busy") {
    return { text: "پرمشغله", color: "bg-[rgba(242,184,75,0.1)] text-[#F2B84B]" };
  }
  return { text: "عادی", color: "bg-[rgba(89,216,195,0.1)] text-[#59D8C3]" };
};

export default function MembersTable({ members }: MembersTableProps) {
  return (
    <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <h3 className="text-base font-bold text-white mb-4">وضعیت اعضای دپارتمان</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.1)]">
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-4">عضو</th>
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-4">وضعیت حضور</th>
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-4">گفتگوهای باز</th>
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-4">میانگین پاسخ</th>
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-4">آخرین فعالیت</th>
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-4">وضعیت کاری</th>
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => {
              const workStatus = getWorkStatusBadge(member.workStatus);
              return (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-[rgba(255,255,255,0.05)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
                          <span className="text-sm font-medium text-white">{member.initial}</span>
                        </div>
                        <div className={`absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-[rgba(9,22,18,0.8)] ${member.status === "online" ? "bg-[#5BE0A8]" : "bg-gray-500"}`} />
                      </div>
                      <span className="text-sm font-medium text-white">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-gray-500">{member.status === "online" ? "آنلاین" : "آفلاین"}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-white">{member.openTickets}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-white">{member.avgResponseTime}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-gray-500">{member.lastActivity}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${workStatus.color}`}>
                      {workStatus.text}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/dashboard/conversations?member=${member.id}`} className="text-xs text-[#59D8C3] hover:text-[#4dc7b5] transition-colors">
                      مشاهده گفتگوها
                    </Link>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}