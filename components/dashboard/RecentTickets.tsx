// components/dashboard/RecentTickets.tsx
"use client";

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface RecentTicketsProps {
  selectedRole?: string;
}

const recentTickets = [
  {
    id: "1042#",
    title: "مشکل در پرداخت",
    time: "15 دقیقه پیش",
    status: "در حال پیگیری",
    statusType: "pending",
    userName: "رضا احمدی",
    department: "حسابدار",
  },
  {
    id: "1043#",
    title: "پیگیری رزرو سفر داخلی",
    time: "45 دقیقه پیش",
    status: "پاسخ داده نشده",
    statusType: "unanswered",
    userName: "الهام بوسفی",
    department: "سفرهای داخلی",
  },
  {
    id: "1044#",
    title: "پیگیری تاریخ پرواز خارجی",
    time: "18:30 روز",
    status: "پاسخ داده شده",
    statusType: "answered",
    userName: "کامران کریمی",
    department: "سفرهای خارجی",
  },
  {
    id: "1045#",
    title: "مشکل در صدور بلیط",
    time: "2 ساعت پیش",
    status: "در حال پیگیری",
    statusType: "pending",
    userName: "سارا محمدی",
    department: "بلیط",
  },
  {
    id: "1046#",
    title: "پیگیری تاریخ پرواز خارجی",
    time: "18:30 روز",
    status: "پاسخ داده شده",
    statusType: "answered",
    userName: "کامران کریمی",
    department: "سفرهای خارجی",
  },
    {
    id: "1048#",
    title: "پیگیری تاریخ پرواز خارجی",
    time: "18:30 روز",
    status: "پاسخ داده شده",
    statusType: "answered",
    userName: "کامشسان کریمی",
    department: "سفرهای خارجی",
  },
];

const getStatusColor = (statusType: string) => {
  switch (statusType) {
    case "pending":
      return "bg-[#1a2e2a] text-gray-400 border-blue-500/30";
    case "unanswered":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "answered":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

const getStatusIcon = (statusType: string) => {
  switch (statusType) {
    case "pending":
      return "🕒";
    case "unanswered":
      return "⚠️";
    case "answered":
      return "✓";
    default:
      return "•";
  }
};

export default function RecentTickets({ selectedRole }: RecentTicketsProps) {
  // فقط 5 تا از آخرین درخواست‌ها را نمایش بده
  const displayTickets = recentTickets.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-[#0D1B17] border border-[#59D8C3]/20 pb-25 rounded-xl overflow-hidden"
    >
      {/* هدر */}
      <div className="flex items-center justify-between p-5">
        <h3 className="text-lg font-semibold text-white">آخرین درخواست‌ها</h3>
        <Link
          href="/dashboard/requests"
          className="text-[#59D8C3] text-sm hover:text-[#5BE0A8] transition-colors flex items-center gap-1"
        >
          <span>مشاهده همه</span>
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* لیست درخواست‌ها */}
      <div className="p-4 space-y-3">
        {displayTickets.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            className="bg-[#12251F] flex flex-row-reverse justify-between rounded-3xl p-4 hover:bg-[#1A352B] transition-all duration-300 cursor-pointer group border border-transparent hover:border-[#59D8C3]/30"
          >
            {/* وضعیت و زمان */}
            <div className="flex flex-col items-center justify-self-end mb-3">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.statusType)}`}
              >
                <span>{getStatusIcon(ticket.statusType)}</span>
                <span>{ticket.status}</span>
              </div>
              <span className="text-xs mt-1 mr-6 text-gray-500">{ticket.time}</span>
            </div>

            {/* اطلاعات تیکت */}
            <div>
              <div className="flex mb-2 gap-2">
                <div className="text-left">
                  <p className="text-[#59D8C3] text-sm mt-1 font-mono">SPI-{ticket.id}</p>
                </div>
                <div>
                  <h4 className="text-white font-medium text-base">{ticket.title}</h4>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex text-xs text-gray-500 gap-2">
                    <p className="font-medium">{ticket.userName}</p>
                    <span>-</span>
                    <p>{ticket.department}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}