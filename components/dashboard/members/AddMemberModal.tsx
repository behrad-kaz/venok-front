// components/dashboard/members/AddMemberModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: {
    name: string;
    username: string;
    password: string;
    confirmPassword: string;
    department: string;
    role: string;
    status: string;
  };
  setFormData: (data: any) => void;
}

const departments = ["حسابداری", "سفرهای داخلی", "سفرهای خارجی", "پشتیبانی فنی"];

const roleDescriptions: Record<string, { title: string; description: string }> = {
  "مدیر کل": {
    title: "مدیر کل",
    description: "به همه دپارتمان‌ها، اعضا و گفتگوها دسترسی دارد.",
  },
  "مدیر دپارتمان": {
    title: "مدیر دپارتمان",
    description: "فقط دپارتمان خودش را مدیریت می‌کند و تیکت‌های همان بخش را می‌بیند.",
  },
  "کارمند پشتیبانی": {
    title: "کارمند پشتیبانی",
    description: "فقط گفتگوهای اختصاص‌داده‌شده به خودش را می‌بیند.",
  },
};

export default function AddMemberModal({ isOpen, onClose, onSubmit, formData, setFormData }: AddMemberModalProps) {
  const selectedRoleDesc = formData.role ? roleDescriptions[formData.role] : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-[#0D1B17] border border-[#59D8C3]/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-white">افزودن عضو جدید</h3>
                <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#12251F] transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-sm font-medium text-gray-300">نام و نام خانوادگی</label><input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="نام کامل را وارد کنید" className="w-full rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-all mt-1.5" /></div>
                <div><label className="text-sm font-medium text-gray-300">نام کاربری</label><input value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} placeholder="username (فارسی نباشد)" className="w-full rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-all mt-1.5" /></div>
                <div><label className="text-sm font-medium text-gray-300">رمز عبور</label><input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="رمز عبور قوی انتخاب کنید" className="w-full rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-all mt-1.5" /></div>
                <div><label className="text-sm font-medium text-gray-300">تکرار رمز عبور</label><input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} placeholder="رمز عبور را دوباره وارد کنید" className="w-full rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-all mt-1.5" /></div>
                <div><label className="text-sm font-medium text-gray-300">دپارتمان</label><select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white focus:outline-none focus:border-[#59D8C3] transition-all mt-1.5 cursor-pointer"><option value="">انتخاب دپارتمان...</option>{departments.map((dept) => (<option key={dept} value={dept}>{dept}</option>))}</select></div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">نقش</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["مدیر کل", "مدیر دپارتمان", "کارمند پشتیبانی"] as const).map((role) => {
                      const isActive = formData.role === role;
                      return (
                        <button
                          key={role}
                          onClick={() => setFormData({ ...formData, role })}
                          className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                            isActive
                              ? role === "مدیر کل"
                                ? "bg-[rgba(89,216,195,0.08)] border-[rgba(89,216,195,0.2)] text-primary"
                                : role === "مدیر دپارتمان"
                                ? "bg-[rgba(91,224,168,0.08)] border-[rgba(91,224,168,0.2)] text-[#5be0a8]"
                                : "bg-[rgba(167,189,182,0.08)] border-[rgba(167,189,182,0.2)] text-gray-400"
                              : "border-[#59D8C3]/20 text-gray-400 hover:border-[#59D8C3]/40 hover:text-white"
                          }`}
                        >
                          {role === "کارمند پشتیبانی" ? "کارمند" : role}
                        </button>
                      );
                    })}
                  </div>
                  {selectedRoleDesc && (
                    <div
                      className={`mt-3 px-3 py-2.5 rounded-xl border text-xs ${
                        formData.role === "مدیر کل"
                          ? "bg-[rgba(89,216,195,0.08)] border-[rgba(89,216,195,0.2)] text-primary"
                          : formData.role === "مدیر دپارتمان"
                          ? "bg-[rgba(91,224,168,0.08)] border-[rgba(91,224,168,0.2)] text-[#5be0a8]"
                          : "bg-[rgba(167,189,182,0.08)] border-[rgba(167,189,182,0.2)] text-gray-400"
                      }`}
                    >
                      <p className="font-medium mb-0.5">{selectedRoleDesc.title}</p>
                      <p className="opacity-80">{selectedRoleDesc.description}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-300">وضعیت</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white focus:outline-none focus:border-[#59D8C3] transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="active">فعال</option>
                    <option value="inactive">غیرفعال</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={onSubmit} className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] font-medium hover:shadow-lg transition-all">ایجاد حساب</button>
                  <button onClick={onClose} className="w-full px-4 py-2.5 rounded-xl bg-[#12251F] border border-[#59D8C3]/20 text-gray-300 hover:border-[#59D8C3]/40 transition-all">انصراف</button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}