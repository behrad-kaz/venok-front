"use client";

import { X, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DepartmentSatisfactionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentName?: string;
}

const satisfactionDistribution = [
  { label: "بسیار راضی", percentage: 65, color: "#59D8C3" },
  { label: "راضی", percentage: 22, color: "rgba(89,216,195,0.6)" },
  { label: "خنثی", percentage: 8, color: "#F2B84B" },
  { label: "ناراضی", percentage: 5, color: "#FF6B6B" },
];

export default function DepartmentSatisfactionReportModal({ 
  isOpen, 
  onClose, 
  departmentName = "پشتیبانی" 
}: DepartmentSatisfactionReportModalProps) {
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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl max-h-[85vh] bg-[rgba(9,22,18,0.98)] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.1)]">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">گزارش رضایت دپارتمان {departmentName}</h2>
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
                <div className="grid grid-cols-1 gap-6">
                  {/* کارت امتیاز رضایت کلی */}
                  <div className="p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] text-center">
                    <div className="w-24 h-24 rounded-full bg-[rgba(89,216,195,0.08)] border-2 border-[#59D8C3] flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl font-bold text-[#59D8C3]">۸۹</span>
                    </div>
                    <p className="text-lg font-medium text-white mb-1">امتیاز رضایت کلی</p>
                    <p className="text-sm text-gray-500">از ۱۰۰ امتیاز</p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#59D8C3]" />
                      <span className="text-sm text-[#59D8C3] font-medium">+۵٪ نسبت به ماه قبل</span>
                    </div>
                  </div>

                  {/* کارت توزیع رضایت */}
                  <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
                    <h4 className="text-base font-medium text-white mb-4">توزیع رضایت</h4>
                    <div className="space-y-4">
                      {satisfactionDistribution.map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{item.label}</span>
                          <div className="flex items-center gap-3 flex-1 mx-4">
                            <div className="flex-1 h-2 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                              />
                            </div>
                            <span className="text-sm font-medium text-white">{item.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
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