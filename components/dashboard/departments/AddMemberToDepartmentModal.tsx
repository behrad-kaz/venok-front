// components/dashboard/departments/AddMemberToDepartmentModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

interface AddMemberToDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    username: string;
    password: string;
  }) => void;
  departmentName: string;
}

export default function AddMemberToDepartmentModal({
  isOpen,
  onClose,
  onSubmit,
  departmentName,
}: AddMemberToDepartmentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.username || !formData.password) return;
    onSubmit(formData);
    setFormData({ name: "", username: "", password: "" });
    onClose();
  };

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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-[#0D1B17] border border-[#59D8C3]/20 rounded-2xl p-6 shadow-2xl">
              {/* هدر مودال */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-white">
                  افزودن عضو جدید به {departmentName}
                </h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#12251F] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* فرم مودال */}
              <div className="space-y-4">
                {/* نام و نام خانوادگی */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-300">
                    نام و نام خانوادگی
                  </label>
                  <input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="نام کامل عضو"
                    className="w-full rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-all"
                  />
                </div>

                {/* نام کاربری */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-300">
                    نام کاربری
                  </label>
                  <input
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="username"
                    className="w-full rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-all"
                  />
                </div>

                {/* رمز عبور */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-300">
                    رمز عبور
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="رمز عبور موقت"
                    className="w-full rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-all"
                  />
                </div>

                {/* دکمه‌ها */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.name || !formData.username || !formData.password}
                    className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ایجاد حساب
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#12251F] border border-[#59D8C3]/20 text-gray-300 hover:border-[#59D8C3]/40 transition-all"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}