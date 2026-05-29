// components/dashboard/members/DeleteMemberModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface DeleteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  memberName?: string;
}

export default function DeleteMemberModal({ isOpen, onClose, onConfirm, memberName }: DeleteMemberModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/70 z-50" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm">
            <div className="bg-[#0D1B17] border border-[#FF6B6B]/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-white">حذف حساب</h3>
                <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#12251F] transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">آیا مطمئن هستید که می‌خواهید حساب {memberName} را حذف کنید؟ این عملیات غیرقابل بازگشت است.</p>
              <div className="flex gap-3"><button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all">حذف</button><button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl bg-[#12251F] border border-[#59D8C3]/20 text-gray-300 hover:border-[#59D8C3]/40 transition-all">انصراف</button></div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}