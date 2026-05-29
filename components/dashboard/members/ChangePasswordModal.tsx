// components/dashboard/members/ChangePasswordModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: { newPassword: string; confirmPassword: string };
  setFormData: (data: any) => void;
  memberName?: string;
}

export default function ChangePasswordModal({ isOpen, onClose, onSubmit, formData, setFormData, memberName }: ChangePasswordModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/70 z-50" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg">
            <div className="bg-[#0D1B17] border border-[#59D8C3]/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-white">تغییر رمز — {memberName}</h3>
                <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#12251F] transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-sm font-medium text-gray-300">رمز عبور جدید</label><input type="password" value={formData.newPassword} onChange={(e) => setFormData({...formData, newPassword: e.target.value})} placeholder="رمز عبور قوی انتخاب کنید" className="w-full rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white mt-1.5" /></div>
                <div><label className="text-sm font-medium text-gray-300">تکرار رمز عبور جدید</label><input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} placeholder="رمز عبور را دوباره وارد کنید" className="w-full rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white mt-1.5" /></div>
                <div className="flex gap-3 pt-2"><button onClick={onSubmit} className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] font-medium hover:shadow-lg transition-all">تغییر رمز</button><button onClick={onClose} className="w-full px-4 py-2.5 rounded-xl bg-[#12251F] border border-[#59D8C3]/20 text-gray-300 hover:border-[#59D8C3]/40 transition-all">انصراف</button></div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}