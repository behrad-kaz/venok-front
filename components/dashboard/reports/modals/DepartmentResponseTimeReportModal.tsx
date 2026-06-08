"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DepartmentResponseTimeReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentName?: string;
}

const peakHoursSLA = [
  { hour: "۱۰-۱۲", load: "بالا", sla: 88, color: "#F2B84B" },
  { hour: "۱۴-۱۶", load: "بالا", sla: 90, color: "#59D8C3" },
  { hour: "۱۶-۱۸", load: "متوسط", sla: 95, color: "#59D8C3" },
  { hour: "۱۸-۲۰", load: "پایین", sla: 98, color: "#59D8C3" },
];

const getLoadText = (load: string) => {
  switch (load) {
    case "بالا":
      return "text-[#f2b84b]";
    case "متوسط":
      return "text-[#8b7fdf]";
    default:
      return "text-gray-500";
  }
};

export default function DepartmentResponseTimeReportModal({ 
  isOpen, 
  onClose, 
  departmentName = "پشتیبانی" 
}: DepartmentResponseTimeReportModalProps) {
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
                <h2 className="text-lg font-bold text-white mb-1">گزارش زمان پاسخ دپارتمان {departmentName}</h2>
                <p className="text-xs text-gray-500">تحلیل سرعت پاسخگویی و SLA</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] text-center">
                    <p className="text-xs text-gray-500 mb-2">میانگین اولین پاسخ</p>
                    <p className="text-2xl font-bold text-[#59D8C3] mb-1">۴ دقیقه</p>
                    <p className="text-xs text-gray-500">هدف: زیر ۱۰ دقیقه</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] text-center">
                    <p className="text-xs text-gray-500 mb-2">میانگین حل گفتگو</p>
                    <p className="text-2xl font-bold text-[#59D8C3] mb-1">۲۳ دقیقه</p>
                    <p className="text-xs text-gray-500">هدف: زیر ۳۰ دقیقه</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] text-center">
                    <p className="text-xs text-gray-500 mb-2">گفتگوهای دیر پاسخ</p>
                    <p className="text-2xl font-bold text-[#F2B84B] mb-1">۸</p>
                    <p className="text-xs text-gray-500">بیشتر از ۱۵ دقیقه</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] text-center">
                    <p className="text-xs text-gray-500 mb-2">نرخ تطابق SLA</p>
                    <p className="text-2xl font-bold text-[#59D8C3] mb-1">۹۲٪</p>
                    <p className="text-xs text-gray-500">هدف: بالای ۹۰٪</p>
                  </div>
                </div>

                {/* ساعات شلوغی و SLA */}
                <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
                  <h3 className="text-sm font-bold text-white mb-4">ساعات شلوغی دپارتمان {departmentName}</h3>
                  <div className="space-y-3">
                    {peakHoursSLA.map((item) => (
                      <div
                        key={item.hour}
                        className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-white">{item.hour}</span>
                          <span className="text-xs text-gray-500">·</span>
                          <span className={`text-xs ${getLoadText(item.load)}`}>بار: {item.load}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">SLA: {item.sla}%</span>
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
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