// components/dashboard/manager/RecentConversations.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { RecentConversation } from "./types";

interface RecentConversationsProps {
  conversations: RecentConversation[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "waiting":
      return { text: "در انتظار", color: "bg-[rgba(242,184,75,0.1)] text-[#F2B84B]" };
    case "answered":
      return { text: "پاسخ داده شده", color: "bg-[rgba(89,216,195,0.1)] text-[#59D8C3]" };
    default:
      return { text: "باز", color: "bg-[rgba(77,171,247,0.1)] text-[#4dabf7]" };
  }
};

export default function RecentConversations({ conversations }: RecentConversationsProps) {
  return (
    <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <h3 className="text-base font-bold text-white mb-4">گفتگوهای مهم اخیر</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.1)]">
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-4">مشتری</th>
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-4">موضوع</th>
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-4">مسئول</th>
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-4">وضعیت</th>
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-4">آخرین فعالیت</th>
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {conversations.map((conv, index) => {
              const statusBadge = getStatusBadge(conv.status);
              return (
                <motion.tr
                  key={conv.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-[rgba(255,255,255,0.05)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-medium text-white">{conv.customerName}</p>
                      <p className="text-xs text-gray-500" dir="ltr">{conv.customerPhone}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">{conv.subject}</span>
                      {conv.isUrgent && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-white">{conv.assignee || "-"}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${statusBadge.color}`}>
                      {statusBadge.text}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-gray-500">{conv.lastActivity}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/dashboard/conversations/${conv.id}`} className="text-xs text-[#59D8C3] hover:text-[#4dc7b5] transition-colors">
                      مشاهده گفتگو
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