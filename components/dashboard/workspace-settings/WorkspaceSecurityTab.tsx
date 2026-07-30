// components/dashboard/workspace-settings/WorkspaceSecurityTab.tsx

"use client";

import { SecuritySettings } from "./types";
import { useState } from "react";

interface WorkspaceSecurityTabProps {
  settings: SecuritySettings;
  onSettingsChange: (settings: SecuritySettings) => void;
}

export default function WorkspaceSecurityTab({ 
  settings, 
  onSettingsChange 
}: WorkspaceSecurityTabProps) {
  const toggleSetting = (key: keyof SecuritySettings) => {
    if (key === "autoLogoutMinutes") return;
    onSettingsChange({ ...settings, [key]: !settings[key] });
  };

  const updateAutoLogout = (minutes: number) => {
    onSettingsChange({ ...settings, autoLogoutMinutes: minutes });
  };

  return (
    <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <h3 className="text-base font-bold text-white mb-5">امنیت</h3>
      
      <div className="space-y-5">
        {/* تنظیمات امنیت */}
        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer">
            <div>
              <p className="text-sm font-medium text-white">الزام رمز قوی برای اعضا</p>
              <p className="text-xs text-gray-500 mt-1">رمز عبور باید حداقل ۸ کاراکتر و شامل حروف و اعداد باشد</p>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting("requireStrongPassword")}
              className={`relative w-11 h-6 rounded-full transition-all ${settings.requireStrongPassword ? "bg-[#59D8C3]" : "bg-gray-600"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${settings.requireStrongPassword ? "right-0.5" : "left-0.5"}`} />
            </button>
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer">
            <div>
              <p className="text-sm font-medium text-white">فعال‌سازی تایید شماره همراه برای تغییر رمز</p>
              <p className="text-xs text-gray-500 mt-1">برای تغییر رمز عبور، کد تایید به شماره همراه ارسال می‌شود</p>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting("requirePhoneVerificationForPasswordChange")}
              className={`relative w-11 h-6 rounded-full transition-all ${settings.requirePhoneVerificationForPasswordChange ? "bg-[#59D8C3]" : "bg-gray-600"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${settings.requirePhoneVerificationForPasswordChange ? "right-0.5" : "left-0.5"}`} />
            </button>
          </label>

          <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
            <label className="block text-sm font-medium text-white mb-3">خروج خودکار بعد از مدت مشخص</label>
            <select
              value={settings.autoLogoutMinutes}
              onChange={(e) => updateAutoLogout(parseInt(e.target.value))}
              className="w-full px-4 py-2 rounded-xl bg-[#0D1B17] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2359D8C3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "left 1rem center",
                backgroundSize: "16px",
              }}
            >
              <option value="15" className="bg-[#0D1B17] text-white">۱۵ دقیقه</option>
              <option value="30" className="bg-[#0D1B17] text-white">۳۰ دقیقه</option>
              <option value="60" className="bg-[#0D1B17] text-white">۱ ساعت</option>
              <option value="120" className="bg-[#0D1B17] text-white">۲ ساعت</option>
              <option value="240" className="bg-[#0D1B17] text-white">۴ ساعت</option>
              <option value="0" className="bg-[#0D1B17] text-white">هیچ‌وقت</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}