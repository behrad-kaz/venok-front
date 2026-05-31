// components/dashboard/EmployeeDashboard.tsx
"use client";

import { motion } from "framer-motion";
import { FileText, AlertCircle, MessageCircle } from "lucide-react";
import Link from "next/link";

interface Ticket {
  id: string;
  title: string;
  customer: string;
  time: string;
  status: "pending" | "unanswered" | "answered" | "closed";
  statusText: string;
}

// تیکت‌های اختصاص یافته به کارمند
const myTickets: Ticket[] = [
  {
    id: "SUP-1042",
    title: "مشکل در پرداخت",
    customer: "رضا احمدی",
    time: "۱۵ دقیقه پیش",
    status: "pending",
    statusText: "در حال پیگیری",
  },
  {
    id: "SUP-1045",
    title: "مشکل در ورود به حساب",
    customer: "مینا صالحی",
    time: "۲ ساعت پیش",
    status: "unanswered",
    statusText: "پاسخ داده نشده",
  },
];

const getStatusBadge = (status: string, statusText: string) => {
  const colors = {
    pending: "bg-[#59D8C3]/10 text-[#59D8C3] border-[#59D8C3]/30",
    unanswered: "bg-[#F2B84B]/10 text-[#F2B84B] border-[#F2B84B]/30",
    answered: "bg-[#5BE0A8]/10 text-[#5BE0A8] border-[#5BE0A8]/30",
    closed: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs ${colors[status as keyof typeof colors]}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 bg-${status === "pending" ? "[#59D8C3]" : status === "unanswered" ? "[#F2B84B]" : status === "answered" ? "[#5BE0A8]" : "gray-400"}`} />
      {statusText}
    </span>
  );
};

export default function EmployeeDashboard() {
  // اطلاعات کارمند (در حالت واقعی از احراز هویت می‌آید)
  const employeeName = "امیر حسینی";
  const employeeRole = "کارمند پشتیبانی";
  const employeeDepartment = "حسابداری";
  const myTicketsCount = myTickets.length;
  const needResponseCount = myTickets.filter(t => t.status === "unanswered").length;

  return (
    <div className="space-y-6">
      {/* دکمه صفحه اصلی */}
      <div className="relative">
        <Link
          href="/"
          className="absolute top-0 left-0 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[#59D8C3]/20 text-[11px] text-gray-400 hover:text-white hover:border-[#59D8C3]/40 transition-all duration-300"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span>صفحه اصلی</span>
        </Link>
        <div className="pt-10">
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">داشبورد من</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                تیکت‌های اختصاص‌یافته به {employeeName}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs bg-gray-500/10 text-gray-400 border-gray-500/30">
              {employeeRole}
            </span>
          </div>
        </div>
      </div>

      {/* کارت‌های آماری */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-5 hover:border-[#59D8C3]/40 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">تیکت‌های من</p>
              <p className="text-2xl font-bold text-[#59D8C3]">{myTicketsCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#59D8C3]/10">
              <FileText className="w-5 h-5 text-[#59D8C3]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-5 hover:border-[#59D8C3]/40 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">نیاز به پاسخ</p>
              <p className="text-2xl font-bold text-[#F2B84B]">{needResponseCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F2B84B]/10">
              <AlertCircle className="w-5 h-5 text-[#F2B84B]" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* اطلاعات کاربر */}
      <div className="p-4 rounded-2xl bg-[#59D8C3]/10 border border-[#59D8C3]/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs bg-gray-500/10 text-gray-400 border-gray-500/30">
            {employeeRole}
          </span>
          <span className="text-xs text-gray-500">دپارتمان: {employeeDepartment}</span>
        </div>
        <p className="text-xs text-gray-500">
          فقط تیکت‌های اختصاص‌داده‌شده به شما نمایش داده می‌شود.
        </p>
      </div>

      {/* تیکت‌های اختصاص یافته به من */}
      <div className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">
          تیکت‌های اختصاص یافته به من
        </h3>
        <div className="space-y-3">
          {myTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[#59D8C3]/20 hover:border-[#59D8C3]/40 cursor-pointer transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#59D8C3]">#{ticket.id}</span>
                  <span className="text-xs text-white truncate">{ticket.title}</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {ticket.customer} · {ticket.time}
                </p>
              </div>
              {getStatusBadge(ticket.status, ticket.statusText)}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}