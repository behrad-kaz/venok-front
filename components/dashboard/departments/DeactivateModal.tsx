// components/dashboard/departments/DeactivateModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface DeactivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  departmentName: string;
}

export default function DeactivateModal({
  isOpen,
  onClose,
  onConfirm,
  departmentName,
}: DeactivateModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* بک‌دراپ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50"
          />

          {/* مودال */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-[#0D1B17] border border-[#FF6B6B]/30 rounded-2xl overflow-hidden shadow-2xl">
              {/* هدر مودال */}
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">
                    غیرفعال‌سازی دپارتمان
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* محتوای مودال */}
              <div className="p-6 text-sm text-right">
                <p className="text-gray-300 leading-6">
                  آیا مطمئن هستید که می‌خواهید دپارتمان{" "}
                  <span className="text-[#59D8C3] font-bold">
                    {departmentName}
                  </span>{" "}
                  را غیرفعال کنید؟ تیکت‌های فعال آن به حالت تعلیق درمی‌آیند.
                </p>
              </div>

              {/* دکمه‌های مودال */}
              <div className="flex gap-3 p-5">
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2 bg-[#411220ce] text-red-500 font-medium rounded-2xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300"
                >
                  غیرفعال‌سازی
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-[#12251F] hover:bg-[#1A352B] text-gray-300 rounded-2xl transition-colors"
                >
                  انصراف
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}