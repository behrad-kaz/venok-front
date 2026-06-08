// components/dashboard/reports/modals/SatisfactionReportModal.tsx
"use client";

import { X, TrendingUp, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SatisfactionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const satisfactionDistribution = [
  { label: "بسیار راضی", percentage: 65, color: "#59D8C3" },
  { label: "راضی", percentage: 22, color: "rgba(89,216,195,0.6)" },
  { label: "خنثی", percentage: 8, color: "#F2B84B" },
  { label: "ناراضی", percentage: 5, color: "#FF6B6B" },
];

const departmentsSatisfaction = [
  { name: "پشتیبانی", score: 89, change: "+۶٪", trend: "up" },
  { name: "فروش", score: 87, change: "+۳٪", trend: "up" },
  { name: "مالی", score: 85, change: "+۲٪", trend: "up" },
  { name: "پیگیری سفارش", score: 84, change: "-۱٪", trend: "down" },
];

export default function SatisfactionReportModal({ isOpen, onClose }: SatisfactionReportModalProps) {
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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-5xl max-h-[85vh] bg-[rgba(9,22,18,0.98)] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.1)]">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">گزارش تفصیلی رضایت</h2>
                <p className="text-xs text-gray-500">تحلیل امتیاز رضایت و بازخورد مشتریان</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* کارت امتیاز رضایت کلی */}
                  <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] text-center">
                    <div className="w-16 h-16 rounded-full bg-[rgba(89,216,195,0.08)] border-2 border-[#59D8C3] flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl font-bold text-[#59D8C3]">۸۷</span>
                    </div>
                    <p className="text-sm font-medium text-white mb-1">امتیاز رضایت کلی</p>
                    <p className="text-xs text-gray-500">از ۱۰۰ امتیاز</p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-[#59D8C3]" />
                      <span className="text-xs text-[#59D8C3] font-medium">+۵٪ نسبت به ماه قبل</span>
                    </div>
                  </div>

                  {/* کارت توزیع رضایت */}
                  <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
                    <h4 className="text-sm font-medium text-white mb-4">توزیع رضایت</h4>
                    <div className="space-y-3">
                      {satisfactionDistribution.map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{item.label}</span>
                          <div className="flex items-center gap-2 flex-1 mx-4">
                            <div className="flex-1 h-2 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                              />
                            </div>
                            <span className="text-xs font-medium text-white">{item.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* رضایت به تفکیک دپارتمان */}
                <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
                  <h3 className="text-sm font-bold text-white mb-4">رضایت به تفکیک دپارتمان</h3>
                  <div className="space-y-3">
                    {departmentsSatisfaction.map((dept) => (
                      <div
                        key={dept.name}
                        className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]"
                      >
                        <span className="text-sm text-white">{dept.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-white">{dept.score}</span>
                          <span
                            className={`text-xs font-medium ${
                              dept.trend === "up" ? "text-[#59D8C3]" : "text-red-400"
                            }`}
                          >
                            {dept.change}
                          </span>
                        </div>
                      </div>
                    ))}
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