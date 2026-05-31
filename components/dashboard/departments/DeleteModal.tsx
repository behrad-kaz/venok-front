// components/dashboard/departments/DeleteModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Trash2 } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  departmentName: string;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  departmentName,
}: DeleteModalProps) {
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
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">حذف دپارتمان</h2>
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
                  <span className="text-[#FF6B6B] font-bold">
                    {departmentName}
                  </span>{" "}
                  را حذف کنید؟
                </p>
                <p className="text-gray-500 text-xs mt-3 leading-5">
                  توجه: این عملیات غیرقابل بازگشت است و تمام اطلاعات مرتبط با این دپارتمان حذف خواهد شد.
                </p>
              </div>

              {/* دکمه‌های مودال */}
              <div className="flex gap-3 p-5">
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 font-medium rounded-2xl hover:bg-red-500/30 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300"
                >
                  حذف
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