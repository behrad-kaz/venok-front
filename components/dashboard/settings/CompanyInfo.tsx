// components/dashboard/settings/CompanyInfo.tsx
"use client";

import { Building2, Save, Check } from "lucide-react";
import { useState } from "react";

interface CompanyInfoProps {
  data: {
    name: string;
    email: string;
    phone: string;
    website: string;
  };
  onUpdate: (data: any) => void;
}

export default function CompanyInfo({ data, onUpdate }: CompanyInfoProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState(data);

  const handleSave = () => {
    onUpdate(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-5">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#59D8C3]" />
          <h3 className="text-sm font-semibold text-white">اطلاعات شرکت</h3>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">اطلاعات اصلی کسب‌وکار شما</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">نام شرکت</label>
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white focus:outline-none focus:border-[#59D8C3] transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">ایمیل پشتیبانی</label>
          <input
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white focus:outline-none focus:border-[#59D8C3] transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">شماره تماس</label>
          <input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white focus:outline-none focus:border-[#59D8C3] transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">وب‌سایت</label>
          <input
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white focus:outline-none focus:border-[#59D8C3] transition-all"
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg px-4 py-2 text-sm"
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? "ذخیره شد" : "ذخیره تغییرات"}</span>
        </button>
      </div>
    </div>
  );
}