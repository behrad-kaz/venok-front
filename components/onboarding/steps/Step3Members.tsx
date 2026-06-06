// components/onboarding/steps/Step3Members.tsx
"use client";

import { useState, useMemo } from "react";
import { Trash2, UserPlus, AlertTriangle, ChevronDown } from "lucide-react";
import { Member, Department } from "../types";

interface Step3MembersProps {
  members: Member[];
  departments: Department[];
  onAddMember: (member: Omit<Member, "id">) => void;
  onRemoveMember: (id: string) => void;
}

export default function Step3Members({ members, departments, onAddMember, onRemoveMember }: Step3MembersProps) {
  const [showForm, setShowForm] = useState(false);
  const [newMember, setNewMember] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    departmentId: "",
    role: "staff" as "manager" | "staff",
  });

  // پیدا کردن دپارتمان‌هایی که مدیر ندارند
  const departmentsWithoutManager = useMemo(() => {
    const departmentsWithManager = members
      .filter(m => m.role === "manager")
      .map(m => m.departmentId);
    
    return departments.filter(dept => !departmentsWithManager.includes(dept.id));
  }, [departments, members]);

  const handleSubmit = () => {
    if (!newMember.firstName || !newMember.lastName || !newMember.phone || !newMember.password || !newMember.departmentId) {
      alert("لطفاً تمام فیلدهای الزامی را پر کنید");
      return;
    }
    if (newMember.password.length < 8) {
      alert("رمز عبور باید حداقل ۸ کاراکتر باشد");
      return;
    }
    
    const selectedDept = departments.find(d => d.id === newMember.departmentId);
    // تولید نام کاربری خودکار از نام و نام خانوادگی
    const autoUsername = `${newMember.firstName}${newMember.lastName}`.toLowerCase().replace(/\s/g, "");
    
    onAddMember({
      ...newMember,
      username: autoUsername,
      departmentName: selectedDept?.name || "",
    });
    
    setNewMember({
      firstName: "",
      lastName: "",
      phone: "",
      password: "",
      departmentId: "",
      role: "staff",
    });
    setShowForm(false);
  };

  // گرفتن حروف اول نام برای آواتار
  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName.charAt(0) || "";
    const last = lastName.charAt(0) || "";
    return `${first}${last}`;
  };

  return (
    <div className="space-y-6">
      {/* اخطار دپارتمان‌های بدون مدیر */}
      {departmentsWithoutManager.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(242,184,75,0.08)] border border-[rgba(242,184,75,0.2)]">
          <AlertTriangle className="w-4 h-4 text-[#f2b84b] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-white mb-1">توجه: دپارتمان‌های بدون مدیر</p>
            <p className="text-xs text-gray-400">
              دپارتمان‌های زیر مدیر ندارند: {departmentsWithoutManager.map(d => d.name).join("، ")}
            </p>
          </div>
        </div>
      )}

      {/* دکمه افزودن عضو جدید - همیشه نمایش داده می‌شود */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full p-4 rounded-xl border-2 border-dashed border-[rgba(255,255,255,0.1)] hover:border-[#59D8C3] hover:bg-[rgba(89,216,195,0.04)] transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:text-[#59D8C3]"
        >
          <UserPlus className="w-4 h-4" />
          افزودن عضو جدید
        </button>
      )}

      {/* فرم افزودن عضو جدید */}
      {showForm && (
        <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
          <h4 className="text-sm font-semibold text-white mb-4">افزودن عضو جدید</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                نام <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={newMember.firstName}
                onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                placeholder="مثال: علی"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                نام خانوادگی <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={newMember.lastName}
                onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                placeholder="مثال: محمدی"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                شماره همراه <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                رمز عبور اولیه <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={newMember.password}
                onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                placeholder="حداقل ۸ کاراکتر"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                دپارتمان <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={newMember.departmentId}
                  onChange={(e) => setNewMember({ ...newMember, departmentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white focus:outline-none focus:border-[#59D8C3] transition-colors appearance-none cursor-pointer"
                  style={{ WebkitAppearance: "none", MozAppearance: "none" }}
                >
                  <option value="" className="text-gray-500">انتخاب کنید</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id} className="text-white bg-[#0D1B17]">
                      {dept.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-2">
                نقش در دپارتمان <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-3">
                <label className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border transition-colors flex-1 ${newMember.role === "manager" ? "border-[#59D8C3] bg-[rgba(89,216,195,0.05)]" : "border-[rgba(255,255,255,0.1)]"}`}>
                  <input
                    type="radio"
                    name="role"
                    checked={newMember.role === "manager"}
                    onChange={() => setNewMember({ ...newMember, role: "manager" })}
                    className="w-4 h-4 text-[#59D8C3]"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">مدیر دپارتمان</p>
                    <p className="text-xs text-gray-500">دسترسی مدیریت و نظارت</p>
                  </div>
                </label>
                <label className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border transition-colors flex-1 ${newMember.role === "staff" ? "border-[#59D8C3] bg-[rgba(89,216,195,0.05)]" : "border-[rgba(255,255,255,0.1)]"}`}>
                  <input
                    type="radio"
                    name="role"
                    checked={newMember.role === "staff"}
                    onChange={() => setNewMember({ ...newMember, role: "staff" })}
                    className="w-4 h-4 text-[#59D8C3]"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">کارمند پشتیبانی</p>
                    <p className="text-xs text-gray-500">پاسخگویی به تیکت‌ها</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-[rgba(255,255,255,0.1)]">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
            >
              انصراف
            </button>
            <button
              onClick={handleSubmit}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg transition-all"
            >
              افزودن عضو
            </button>
          </div>
        </div>
      )}

      {/* لیست اعضای اضافه شده */}
      {members.length > 0 && (
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(89,216,195,0.3)] transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {/* آواتار */}
                  <div className="relative flex-shrink-0">
                    <div className="rounded-xl inline-flex items-center justify-center font-semibold bg-[rgba(89,216,195,0.14)] text-[#59D8C3] border border-[rgba(89,216,195,0.2)] w-9 h-9 text-xs">
                      {getInitials(member.firstName, member.lastName)}
                    </div>
                  </div>
                  {/* اطلاعات عضو */}
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-semibold text-white">
                      {member.firstName} {member.lastName}
                    </h5>
                    <p className="text-xs text-gray-500" dir="ltr">
                      @{member.username}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        member.role === "manager" 
                          ? "bg-[rgba(89,216,195,0.1)] text-[#59D8C3] border-[rgba(89,216,195,0.2)]" 
                          : "bg-[rgba(255,255,255,0.05)] text-gray-400 border-[rgba(255,255,255,0.1)]"
                      }`}>
                        {member.role === "manager" ? "مدیر دپارتمان" : "کارمند پشتیبانی"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(255,255,255,0.05)] text-gray-400 border border-[rgba(255,255,255,0.1)]">
                        {member.departmentName}
                      </span>
                      <span className="text-[10px] text-gray-500" dir="ltr">
                        {member.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveMember(member.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-[rgba(255,107,107,0.08)] transition-colors flex-shrink-0"
                  title="حذف عضو"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* پیام خالی بودن لیست اعضا - همیشه نمایش داده می‌شود وقتی عضوی وجود نداشته باشد */}
      {members.length === 0 && (
        <div className="p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-dashed border-[rgba(255,255,255,0.1)] text-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-gray-500">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p className="text-sm text-gray-400 mb-1">هنوز عضوی اضافه نشده</p>
          <p className="text-xs text-gray-500">اعضای تیم پشتیبانی خود را اضافه کنید.</p>
        </div>
      )}
    </div>
  );
}