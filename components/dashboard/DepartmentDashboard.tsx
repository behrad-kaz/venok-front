// components/dashboard/DepartmentDashboard.tsx
"use client";

import { motion } from "framer-motion";
import { FileText, AlertCircle, Users, Clock, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function DepartmentDashboard() {
  // اطلاعات دپارتمان (در حالت واقعی از API گرفته می‌شود)
  const departmentData = {
    name: "سفرهای داخلی",
    tickets: 19,
    unanswered: 6,
    members: 8,
    avgResponse: "11 دقیقه",
  };

  const recentTickets = [
    { id: "SUP-1042", title: "مشکل در پرداخت", customer: "رضا احمدی", status: "pending", statusText: "در حال پیگیری", statusColor: "primary" },
    { id: "SUP-1043", title: "پیگیری رزرو سفر داخلی", customer: "الهام یوسفی", status: "unanswered", statusText: "پاسخ داده نشده", statusColor: "warning" },
    { id: "SUP-1046", title: "استرداد وجه بلیط", customer: "حسین محمدی", status: "pending", statusText: "در حال پیگیری", statusColor: "primary" },
    { id: "SUP-1047", title: "تغییر مسافر", customer: "زینب نوری", status: "unanswered", statusText: "پاسخ داده نشده", statusColor: "warning" },
  ];

  const getStatusBadge = (status: string, statusText: string, color: string) => {
    const colors = {
      primary: "bg-[#59D8C3]/10 text-[#59D8C3] border-[#59D8C3]/30",
      warning: "bg-[#F2B84B]/10 text-[#F2B84B] border-[#F2B84B]/30",
    };
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs ${colors[color as keyof typeof colors]}`}>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 bg-${color === "primary" ? "[#59D8C3]" : "[#F2B84B]"}`} />
        {statusText}
      </span>
    );
  };

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
              <h2 className="text-xl font-bold text-white">داشبورد دپارتمان</h2>
              <p className="text-sm text-gray-500 mt-0.5">مدیریت دپارتمان {departmentData.name}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs bg-[#5BE0A8]/10 text-[#5BE0A8] border-[#5BE0A8]/30">
              مدیر دپارتمان
            </span>
          </div>
        </div>
      </div>

      {/* کارت‌های آماری */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-5 hover:border-[#59D8C3]/40 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">تیکت‌های دپارتمان</p>
              <p className="text-2xl font-bold text-[#59D8C3]">{departmentData.tickets}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#59D8C3]/10">
              <FileText className="w-5 h-5 text-[#59D8C3]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-5 hover:border-[#59D8C3]/40 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">پاسخ داده نشده</p>
              <p className="text-2xl font-bold text-[#F2B84B]">{departmentData.unanswered}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F2B84B]/10">
              <AlertCircle className="w-5 h-5 text-[#F2B84B]" />
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
              <p className="text-xs text-gray-500 mb-1">اعضای دپارتمان</p>
              <p className="text-2xl font-bold text-[#5BE0A8]">{departmentData.members}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#5BE0A8]/10">
              <Users className="w-5 h-5 text-[#5BE0A8]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-5 hover:border-[#59D8C3]/40 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">میانگین پاسخ</p>
              <p className="text-2xl font-bold text-[#5BE0A8]">{departmentData.avgResponse}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#5BE0A8]/10">
              <Clock className="w-5 h-5 text-[#5BE0A8]" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* اطلاعات دپارتمان */}
      <div className="p-4 rounded-2xl bg-[#59D8C3]/10 border border-[#59D8C3]/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-[#59D8C3]">دپارتمان: {departmentData.name}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs bg-[#59D8C3]/10 text-[#59D8C3] border-[#59D8C3]/30">مدیر دپارتمان</span>
        </div>
        <p className="text-xs text-gray-500">شما دسترسی به تیکت‌ها و اعضای دپارتمان خود دارید.</p>
      </div>

      {/* آخرین تیکت‌های دپارتمان */}
      <div className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">آخرین تیکت‌های دپارتمان</h3>
          <button className="text-xs text-[#59D8C3] hover:text-[#5BE0A8] transition-colors">مشاهده همه</button>
        </div>
        <div className="space-y-3">
          {recentTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[#59D8C3]/20 hover:border-[#59D8C3]/40 cursor-pointer transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#59D8C3]">{ticket.id}</span>
                  <span className="text-xs text-white truncate">{ticket.title}</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">{ticket.customer}</p>
              </div>
              {getStatusBadge(ticket.status, ticket.statusText, ticket.statusColor)}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}