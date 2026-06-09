// components/dashboard/workspace-settings/WorkspaceSecurityTab.tsx

"use client";

import { SecuritySettings, Session } from "./types";
import { Monitor, Smartphone, Laptop, LogOut } from "lucide-react";

interface WorkspaceSecurityTabProps {
  settings: SecuritySettings;
  onSettingsChange: (settings: SecuritySettings) => void;
  sessions: Session[];
  onLogoutAll: () => void;
  onLogoutSession: (sessionId: string) => void;
}

const getDeviceIcon = (type: Session["deviceType"]) => {
  switch (type) {
    case "mobile":
      return <Smartphone className="w-5 h-5" />;
    case "tablet":
      return <Smartphone className="w-5 h-5" />;
    default:
      return <Monitor className="w-5 h-5" />;
  }
};

export default function WorkspaceSecurityTab({ 
  settings, 
  onSettingsChange, 
  sessions, 
  onLogoutAll, 
  onLogoutSession 
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
      <h3 className="text-base font-bold text-white mb-5">امنیت و نشست‌ها</h3>
      
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

        {/* نشست‌های فعال */}
        <div className="pt-5 border-t border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center justify-between mt-2  mb-4">
            <h4 className="text-sm font-medium text-white">نشست‌های فعال</h4>
            <button
              onClick={onLogoutAll}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[rgba(255,107,107,0.08)] text-red-400 border border-[rgba(255,107,107,0.15)] hover:bg-[rgba(255,107,107,0.12)] transition-all"
            >
              خروج از همه نشست‌ها
            </button>
          </div>

          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-xl border transition-all ${
                  session.isCurrent
                    ? "bg-[rgba(89,216,195,0.08)] border-[rgba(89,216,195,0.15)]"
                    : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.1)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center flex-shrink-0 text-gray-500">
                      {getDeviceIcon(session.deviceType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-white">{session.device}</p>
                        {session.isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F]">
                            نشست فعلی
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{session.browser}</p>
                      <p className="text-xs text-gray-500 mt-1">{session.location} • آخرین فعالیت: {session.lastActivity}</p>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => onLogoutSession(session.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-[rgba(255,107,107,0.08)] transition-all flex-shrink-0 flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" />
                      خروج
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}