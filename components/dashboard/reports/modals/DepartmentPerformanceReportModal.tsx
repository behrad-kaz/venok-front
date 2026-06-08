"use client";

import { X, TrendingUp, MessageCircle, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import DepartmentConversationTrend from "../DepartmentConversationTrend";

interface DepartmentPerformanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentName?: string;
}

const departmentTrendData = [
  { day: "شنبه", new: 42, solved: 38 },
  { day: "یکشنبه", new: 38, solved: 35 },
  { day: "دوشنبه", new: 45, solved: 42 },
  { day: "سه‌شنبه", new: 40, solved: 38 },
  { day: "چهارشنبه", new: 48, solved: 45 },
  { day: "پنجشنبه", new: 38, solved: 32 },
  { day: "جمعه", new: 33, solved: 26 },
];

const topMembers = [
  { name: "سارا احمدی", initials: "سا", answered: 48, avgTime: "۳ دقیقه", openTickets: 5, lastActivity: "۲ دقیقه پیش" },
  { name: "نیلوفر محمدی", initials: "نم", answered: 42, avgTime: "۵ دقیقه", openTickets: 4, lastActivity: "۱ دقیقه پیش" },
  { name: "رضا کریمی", initials: "رک", answered: 35, avgTime: "۶ دقیقه", openTickets: 2, lastActivity: "۱۵ دقیقه پیش" },
];

export default function DepartmentPerformanceReportModal({ 
  isOpen, 
  onClose, 
  departmentName = "پشتیبانی" 
}: DepartmentPerformanceReportModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl max-h-[85vh] bg-[rgba(9,22,18,0.98)] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.1)]">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">گزارش عملکرد دپارتمان {departmentName}</h2>
                <p className="text-xs text-gray-500">تحلیل عملکرد تیم دپارتمان {departmentName}</p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.04)] border border-transparent hover:border-[rgba(255,255,255,0.1)] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto rtl-scrollbar max-h-[calc(85vh-100px)]">
              <div className="space-y-6">
                {/* کارت‌های آماری */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-11 h-11 rounded-xl bg-[rgba(89,216,195,0.08)] border border-[rgba(89,216,195,0.15)] flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-[#59D8C3]" />
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-[rgba(89,216,195,0.08)] text-[#59D8C3]">
                        <TrendingUp className="w-3 h-3" />
                        <span>+۱۲٪</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-white">127</p>
                      <p className="text-sm text-gray-500">کل گفتگوهای دپارتمان</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-11 h-11 rounded-xl bg-[rgba(89,216,195,0.08)] border border-[rgba(89,216,195,0.15)] flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-[#59D8C3]" />
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-[rgba(89,216,195,0.08)] text-[#59D8C3]">
                        <TrendingUp className="w-3 h-3" />
                        <span>+۳٪</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-white">۹۱٪</p>
                      <p className="text-sm text-gray-500">نرخ حل‌شدن</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-11 h-11 rounded-xl bg-[rgba(89,216,195,0.08)] border border-[rgba(89,216,195,0.15)] flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#59D8C3]" />
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-[rgba(89,216,195,0.08)] text-[#59D8C3]">
                        <TrendingUp className="w-3 h-3" />
                        <span>+۵٪</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-white">۸۹٪</p>
                      <p className="text-sm text-gray-500">رضایت مشتریان</p>
                    </div>
                  </div>
                </div>

                {/* روند عملکرد هفتگی */}
                <DepartmentConversationTrend data={departmentTrendData} />

                {/* برترین اعضای تیم */}
                <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
                  <h3 className="text-sm font-bold text-white mb-4">برترین اعضای دپارتمان {departmentName}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[rgba(255,255,255,0.1)]">
                          <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">عضو</th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">گفتگوهای پاسخ‌داده‌شده</th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">میانگین زمان پاسخ</th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">گفتگوهای باز</th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">آخرین فعالیت</th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-gray-500"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {topMembers.map((member) => (
                          <tr key={member.name} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="rounded-xl inline-flex items-center justify-center font-semibold bg-[rgba(89,216,195,0.14)] text-[#59D8C3] border border-[rgba(89,216,195,0.2)] w-7 h-7 text-[10px]">
                                  {member.initials}
                                </span>
                                <span className="text-white font-medium">{member.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4"><span className="text-white">{member.answered}</span></td>
                            <td className="py-3 px-4"><span className="text-white">{member.avgTime}</span></td>
                            <td className="py-3 px-4"><span className="text-white">{member.openTickets}</span></td>
                            <td className="py-3 px-4"><span className="text-gray-500">{member.lastActivity}</span></td>
                            <td className="py-3 px-4">
                              <Link href="/dashboard/conversations" className="text-xs font-medium text-[#59D8C3] hover:text-[#6ef3dc] transition-colors">
                                مشاهده گفتگوها
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}