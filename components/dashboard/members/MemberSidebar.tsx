// components/dashboard/members/MemberSidebar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { useModal } from "@/components/ui/modal";
import { Department, Member } from "./types";

interface MemberSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  editingMember: Member | null;
  departments: Department[];
  onSave: (data: {
    firstName: string;
    lastName: string;
    username: string;
    phone: string;
    departmentId: number;
    role: "مدیر دپارتمان" | "کارمند";
    status: "active" | "inactive";
    password?: string;
  }) => void;
  title: string;
  subtitle?: string;
}

export default function MemberSidebar({
  isOpen,
  onClose,
  editingMember,
  departments,
  onSave,
  title,
  subtitle,
}: MemberSidebarProps) {
  const { showWarning, showError, showSuccess } = useModal();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState<number>(0);
  const [role, setRole] = useState<"مدیر دپارتمان" | "کارمند">("کارمند");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const isInitialized = useRef(false);

  useEffect(() => {
    if (editingMember) {
      setFirstName(editingMember.firstName);
      setLastName(editingMember.lastName);
      setUsername(editingMember.username);
      setPhone(editingMember.phone);
      setDepartmentId(editingMember.departmentId);
      setRole(editingMember.role);
      setStatus(editingMember.status);
      setPassword("");
      setConfirmPassword("");
    } else {
      setFirstName("");
      setLastName("");
      setUsername("");
      setPhone("");
      setDepartmentId(0);
      setRole("کارمند");
      setStatus("active");
      setPassword("");
      setConfirmPassword("");
    }
    isInitialized.current = true;
  }, [editingMember]);

  // ✅ گوش دادن به رویداد modalOpened برای بستن سایدبار
  useEffect(() => {
    if (!isOpen) return;

    const handleModalOpened = () => {
      console.log('🔴 مودال باز شد، بستن سایدبار...');
      onClose();
    };

    // گوش دادن به رویداد سفارشی
    window.addEventListener('modalOpened', handleModalOpened);

    return () => {
      window.removeEventListener('modalOpened', handleModalOpened);
    };
  }, [isOpen, onClose]);

  // ✅ همچنین با MutationObserver هم بررسی می‌کنیم
  useEffect(() => {
    if (!isOpen) return;

    const observer = new MutationObserver(() => {
      // بررسی وجود مودال در DOM
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
    
    if (!firstName || !lastName || !username || !phone || !departmentId) {
      showWarning("لطفاً تمام فیلدهای الزامی را پر کنید", "خطا در فرم");
      return;
    }
    
    if (!editingMember) {
      if (!password || password.length < 8) {
        showWarning("رمز عبور باید حداقل ۸ کاراکتر باشد", "خطا در رمز عبور");
        return;
      }
      
      if (password !== confirmPassword) {
        showWarning("رمز عبور و تکرار آن مطابقت ندارند", "خطا در تکرار رمز");
        return;
      }
    }
    
    const phoneRegex = /^09[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      showWarning("شماره همراه باید با 09 شروع شود و ۱۱ رقم باشد", "خطا در شماره همراه");
      return;
    }
    
    if (username.length < 3) {
      showWarning("نام کاربری باید حداقل ۳ کاراکتر باشد", "خطا در نام کاربری");
      return;
    }
    
    onSave({
      firstName,
      lastName,
      username,
      phone,
      departmentId,
      role,
      status,
      ...(password && { password }),
    });
    
    const actionText = editingMember ? "ویرایش" : "افزودن";
    showSuccess(`عضو با موفقیت ${actionText} شد`, "موفقیت ✨");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" 
        onClick={onClose} 
      />
      
      <div className="fixed left-0 top-0 bottom-0 w-full max-w-md bg-[rgba(9,22,18,0.98)] border-l border-[rgba(255,255,255,0.1)] z-[100] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">{title}</h2>
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                نام <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="نام عضو"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                نام خانوادگی <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="نام خانوادگی عضو"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                نام کاربری <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                required
                dir="ltr"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">حداقل ۳ کاراکتر</p>
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
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">شماره همراه باید با 09 شروع شود</p>
            </div>

            {!editingMember && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    رمز عبور اولیه <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="حداقل ۸ کاراکتر"
                      required
                      minLength={8}
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">رمز عبور باید حداقل ۸ کاراکتر باشد</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    تکرار رمز عبور <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="تکرار رمز عبور"
                      required
                      minLength={8}
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                دپارتمان <span className="text-red-400">*</span>
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(parseInt(e.target.value))}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:border-[#59D8C3] transition-colors cursor-pointer"
              >
                <option value={0}>انتخاب دپارتمان</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
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
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                    role === "کارمند"
                      ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                      : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-gray-500 hover:text-white"
                  }`}
                >
                  کارمند
                </button>
                <button
                  type="button"
                  onClick={() => setRole("مدیر دپارتمان")}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                    role === "مدیر دپارتمان"
                      ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                      : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-gray-500 hover:text-white"
                  }`}
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
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                    status === "active"
                      ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                      : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-gray-500 hover:text-white"
                  }`}
                >
                  فعال
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("inactive")}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                    status === "inactive"
                      ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                      : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-gray-500 hover:text-white"
                  }`}
                >
                  غیرفعال
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[rgba(255,255,255,0.1)]">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg transition-all"
              >
                {editingMember ? "ذخیره تغییرات" : "افزودن عضو"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}