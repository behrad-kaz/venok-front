// components/dashboard/workspace-settings/WorkspaceSupportTab.tsx

"use client";

import { SupportInfo } from "./types";

interface WorkspaceSupportTabProps {
  info: SupportInfo;
  onInfoChange: (info: SupportInfo) => void;
}

export default function WorkspaceSupportTab({ info, onInfoChange }: WorkspaceSupportTabProps) {
  return (
    <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <h3 className="text-base font-bold text-white mb-2">اطلاعات پشتیبانی</h3>
      <p className="text-sm text-gray-500 mb-5">این اطلاعات در بخش‌های عمومی و ارتباطات پشتیبانی استفاده می‌شود.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-white mb-2">شماره تماس پشتیبانی</label>
          <input
            type="text"
            placeholder="۰۲۱-۱۲۳۴۵۶۷۸"
            value={info.phone}
            onChange={(e) => onInfoChange({ ...info, phone: e.target.value })}
            className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">ایمیل پشتیبانی</label>
          <input
            type="email"
            placeholder="support@example.com"
            value={info.email}
            onChange={(e) => onInfoChange({ ...info, email: e.target.value })}
            className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">شماره همراه اصلی برای هشدارهای مدیریتی</label>
          <input
            type="text"
            placeholder="۰۹۱۲-۱۲۳-۴۵۶۷"
            value={info.alertPhone}
            onChange={(e) => onInfoChange({ ...info, alertPhone: e.target.value })}
            className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            dir="ltr"
          />
        </div>
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-white mb-2">متن کوتاه معرفی پشتیبانی</label>
          <textarea
            rows={3}
            value={info.introText}
            onChange={(e) => onInfoChange({ ...info, introText: e.target.value })}
            className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
}