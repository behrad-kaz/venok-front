// components/dashboard/workspace-settings/WorkspaceNotificationsTab.tsx

"use client";

import { NotificationSettings } from "./types";

interface WorkspaceNotificationsTabProps {
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
  smsCredit: number;
  smsStatus: "connected" | "disconnected";
  lastSmsSent: string;
  onCheckSmsConnection: () => void;
}

export default function WorkspaceNotificationsTab({ 
  settings, 
  onSettingsChange, 
  smsCredit, 
  smsStatus, 
  lastSmsSent,
  onCheckSmsConnection 
}: WorkspaceNotificationsTabProps) {
  const toggleSetting = (key: keyof NotificationSettings) => {
    onSettingsChange({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <h3 className="text-base font-bold text-white mb-5">اعلان‌ها و پیامک</h3>
      
      <div className="space-y-5">
        {/* وضعیت سرویس پیامک */}
        <div className="p-5 rounded-xl border bg-[rgba(89,216,195,0.08)] border-[rgba(89,216,195,0.15)]">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#59D8C3" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <div>
                <p className="text-sm font-medium text-white">
                  وضعیت سرویس پیامک: {smsStatus === "connected" ? "متصل" : "قطع"}
                </p>
                <p className="text-xs text-gray-500 mt-1">آخرین ارسال موفق: {lastSmsSent}</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500">اعتبار باقی‌مانده</p>
              <p className="text-lg font-bold text-white">{smsCredit.toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={onCheckSmsConnection}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.08)] text-white border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.12)] transition-all"
          >
            بررسی اتصال پیامک
          </button>
        </div>

        {/* تنظیمات اعلان‌ها */}
        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer">
            <span className="text-sm font-medium text-white">ارسال پیامک لینک گفتگو</span>
            <button
              type="button"
              onClick={() => toggleSetting("sendLinkSms")}
              className={`relative w-11 h-6 rounded-full transition-all ${settings.sendLinkSms ? "bg-[#59D8C3]" : "bg-gray-600"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${settings.sendLinkSms ? "right-0.5" : "left-0.5"}`} />
            </button>
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer">
            <span className="text-sm font-medium text-white">ارسال OTP برای تغییر رمز</span>
            <button
              type="button"
              onClick={() => toggleSetting("sendOtpForPasswordChange")}
              className={`relative w-11 h-6 rounded-full transition-all ${settings.sendOtpForPasswordChange ? "bg-[#59D8C3]" : "bg-gray-600"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${settings.sendOtpForPasswordChange ? "right-0.5" : "left-0.5"}`} />
            </button>
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer">
            <span className="text-sm font-medium text-white">اطلاع‌رسانی گفتگوهای بدون پاسخ به مدیرکل</span>
            <button
              type="button"
              onClick={() => toggleSetting("notifyManagerForUnanswered")}
              className={`relative w-11 h-6 rounded-full transition-all ${settings.notifyManagerForUnanswered ? "bg-[#59D8C3]" : "bg-gray-600"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${settings.notifyManagerForUnanswered ? "right-0.5" : "left-0.5"}`} />
            </button>
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer">
            <span className="text-sm font-medium text-white">اعلان گفتگوهای جدید</span>
            <button
              type="button"
              onClick={() => toggleSetting("notifyNewConversations")}
              className={`relative w-11 h-6 rounded-full transition-all ${settings.notifyNewConversations ? "bg-[#59D8C3]" : "bg-gray-600"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${settings.notifyNewConversations ? "right-0.5" : "left-0.5"}`} />
            </button>
          </label>
        </div>
      </div>
    </div>
  );
}