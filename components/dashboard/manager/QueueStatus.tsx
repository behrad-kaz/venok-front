// components/dashboard/manager/QueueStatus.tsx
"use client";

import { motion } from "framer-motion";

interface QueueStatusProps {
  status: {
    newTickets: number;
    inProgress: number;
    unassigned: number;
    closedToday: number;
  };
}

export default function QueueStatus({ status }: QueueStatusProps) {
  const items = [
    { id: 1, title: "گفتگوهای جدید", value: status.newTickets, color: "#4dabf7", bg: "bg-[rgba(77,171,247,0.1)]" },
    { id: 2, title: "در حال پاسخ‌گویی", value: status.inProgress, color: "#59D8C3", bg: "bg-[rgba(89,216,195,0.1)]" },
    { id: 3, title: "بدون مسئول", value: status.unassigned, color: "#F2B84B", bg: "bg-[rgba(242,184,75,0.1)]" },
    { id: 4, title: "بسته‌شده امروز", value: status.closedToday, color: "#9CA3AF", bg: "bg-[rgba(255,255,255,0.05)]" },
  ];

  return (
    <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <h3 className="text-base font-bold text-white mb-4">وضعیت صف دپارتمان</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl ${item.bg} border border-[rgba(255,255,255,0.1)]`}
          >
            <p className="text-xs text-gray-500 mb-2">{item.title}</p>
            <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}