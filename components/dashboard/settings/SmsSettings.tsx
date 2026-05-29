// components/dashboard/settings/SmsSettings.tsx
"use client";

import { useState } from "react";
import { SmsSettingsData } from "./types";

interface SmsSettingsProps {
  data: SmsSettingsData;
  onUpdate: (data: SmsSettingsData) => void;
}

export default function SmsSettings({ data, onUpdate }: SmsSettingsProps) {
  const [formData, setFormData] = useState(data);

  const handleToggle = () => {
    const newData = { ...formData, isEnabled: !formData.isEnabled };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleChange = (field: keyof SmsSettingsData, value: string | boolean) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  return (
    <div className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">ارسال پیامک</h3>
        <p className="text-xs text-gray-500 mt-0.5">تنظیمات سیستم ارسال لینک پشتیبانی</p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-[#5BE0A8] shadow-[0_0_8px_rgba(91,224,168,0.5)]" />
        <span className="text-sm text-white">سرویس پیامک</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs bg-[#5BE0A8]/10 text-[#5BE0A8] border-[#5BE0A8]/30">
          {data.isConnected ? "متصل" : "قطع"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">شماره فرستنده</label>
          <input
            value={formData.senderNumber}
            onChange={(e) => handleChange("senderNumber", e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white focus:outline-none focus:border-[#59D8C3] transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">API Key پنل پیامک</label>
          <input
            type="password"
            value={formData.apiKey}
            onChange={(e) => handleChange("apiKey", e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white focus:outline-none focus:border-[#59D8C3] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center justify-between py-2.5 border-t border-[#59D8C3]/20">
        <span className="text-sm text-white">ارسال پیامک فعال باشد</span>
        <button
          onClick={handleToggle}
          className="relative w-10 h-5.5 rounded-full transition-colors duration-200"
          style={{ backgroundColor: formData.isEnabled ? "#59D8C3" : "#4B5563", height: "22px" }}
        >
          <span
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
            style={{ left: formData.isEnabled ? "calc(100% - 18px)" : "2px" }}
          />
        </button>
      </div>
    </div>
  );
}