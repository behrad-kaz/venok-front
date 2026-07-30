// ============================================================
// FILE: components/dashboard/members/MemberSidebar.tsx
// ============================================================
"use client";

import { useState, useEffect, useRef } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { useModal } from "@/components/ui/modal";
import { Department, Member } from "./types";

interface MemberSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  editingMember: Member | null;
  departments: Department[];
  onSave: (data: {
    fullName: string;
    phone: string;
    departmentId: number;
    role: "مدیر دپارتمان" | "کارمند";
    status: "active" | "inactive";
    password?: string;
  }) => void;
  title: string;
  subtitle?: string;
  isSubmitting?: boolean;
}

export default function MemberSidebar({
  isOpen,
  onClose,
  editingMember,
  departments,
  onSave,
  title,
  subtitle,
  isSubmitting = false,
}: MemberSidebarProps) {
  const { showWarning, showError, showSuccess } = useModal();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState<number>(0);
  const [role, setRole] = useState<"مدیر دپارتمان" | "کارمند">("کارمند");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const isInitialized = useRef(false);

  useEffect(() => {
    if (editingMember) {
      const name = `${editingMember.firstName || ''} ${editingMember.lastName || ''}`.trim();
      setFullName(name || "");
      setPhone(editingMember.phone || "");
      setDepartmentId(editingMember.departmentId || 0);
      setRole(editingMember.role || "کارمند");
      setStatus(editingMember.status || "active");
      setPassword(""); // ✅ در ویرایش، رمز عبور خالی می‌شود (اختیاری)
    } else {
      setFullName("");
      setPhone("");
      setDepartmentId(0);
      setRole("کارمند");
      setStatus("active");
      setPassword("");
    }
    isInitialized.current = true;
  }, [editingMember]);

  useEffect(() => {
    if (!isOpen) return;

    const handleModalOpened = () => {
      console.log('🔴 مودال باز شد، بستن سایدبار...');
      onClose();
    };

    window.addEventListener('modalOpened', handleModalOpened);

    return () => {
      window.removeEventListener('modalOpened', handleModalOpened);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const observer = new MutationObserver(() => {
      const modalOverlay = document.querySelector('.fixed.inset-0.z-\\[1000\\], .fixed.inset-0.z-\\[1001\\]');
      if (modalOverlay) {
        console.log('🔴 مودال در DOM تشخیص داده شد، بستن سایدبار...');
        onClose();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!fullName.trim() || !phone.trim() || !departmentId) {
      showWarning("لطفاً تمام فیلدهای الزامی را پر کنید", "خطا در فرم");
      return;
    }
    
    // ✅ در حالت افزودن، رمز عبور اجباری است
    if (!editingMember) {
      if (!password || password.length < 8) {
        showWarning("رمز عبور باید حداقل ۸ کاراکتر باشد", "خطا در رمز عبور");
        return;
      }
    }
    
    // ✅ در حالت ویرایش، اگر رمز عبور وارد شده باشد، باید حداقل ۸ کاراکتر باشد
    if (editingMember && password && password.length < 8) {
      showWarning("رمز عبور باید حداقل ۸ کاراکتر باشد", "خطا در رمز عبور");
      return;
    }
    
    const phoneRegex = /^09[0-9]{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      showWarning("شماره همراه باید با 09 شروع شود و ۱۱ رقم باشد", "خطا در شماره همراه");
      return;
    }
    
    const saveData: {
      fullName: string;
      phone: string;
      departmentId: number;
      role: "مدیر دپارتمان" | "کارمند";
      status: "active" | "inactive";
      password?: string;
    } = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      departmentId,
      role,
      status,
    };
    
    // ✅ فقط در صورتی که رمز عبور وارد شده باشد، آن را ارسال کن
    // (در حالت افزودن اجباری است، در حالت ویرایش اختیاری)
    if (password) {
      saveData.password = password;
    }
    
    onSave(saveData);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" 
        onClick={handleClose} 
      />
      
      <div className="fixed left-0 top-0 bottom-0 w-full max-w-md bg-[rgba(9,22,18,0.98)] border-l border-[rgba(255,255,255,0.1)] z-[100] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">{title}</h2>
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                نام و نام خانوادگی <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثال: علی محمدی"
                required
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                شماره همراه <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                required
                dir="ltr"
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">شماره همراه باید با 09 شروع شود</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {editingMember ? "رمز عبور جدید (اختیاری)" : "رمز عبور اولیه"} <span className="text-red-400">{!editingMember ? "*" : ""}</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingMember ? "برای تغییر رمز عبور وارد کنید" : "حداقل ۸ کاراکتر"}
                  required={!editingMember}
                  minLength={8}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {editingMember ? "در صورت تمایل رمز عبور را تغییر دهید" : "رمز عبور باید حداقل ۸ کاراکتر باشد"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                دپارتمان <span className="text-red-400">*</span>
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(parseInt(e.target.value))}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:border-[#59D8C3] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value={0} className="bg-[#0D1B17] text-white">انتخاب دپارتمان</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id} className="bg-[#0D1B17] text-white hover:bg-[rgba(89,216,195,0.1)]">
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                نقش در دپارتمان <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("کارمند")}
                  disabled={isSubmitting}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                    role === "کارمند"
                      ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                      : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-gray-500 hover:text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  کارمند
                </button>
                <button
                  type="button"
                  onClick={() => setRole("مدیر دپارتمان")}
                  disabled={isSubmitting}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                    role === "مدیر دپارتمان"
                      ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                      : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-gray-500 hover:text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  مدیر دپارتمان
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">وضعیت اولیه</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus("active")}
                  disabled={isSubmitting}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                    status === "active"
                      ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                      : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-gray-500 hover:text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  فعال
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("inactive")}
                  disabled={isSubmitting}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                    status === "inactive"
                      ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                      : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-gray-500 hover:text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  غیرفعال
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[rgba(255,255,255,0.1)]">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    در حال ذخیره...
                  </>
                ) : (
                  editingMember ? "ذخیره تغییرات" : "افزودن عضو"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
// ============================================================