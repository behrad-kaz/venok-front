// components/dashboard/settings/SecuritySettings.tsx
"use client";

import { useState } from "react";
import { SecuritySettingsData } from "./types";

interface SecuritySettingsProps {
  data: SecuritySettingsData;
  onUpdate: (data: SecuritySettingsData) => void;
}

export default function SecuritySettings({ data, onUpdate }: SecuritySettingsProps) {
  const [formData, setFormData] = useState(data);

  const handleToggle = (field: keyof SecuritySettingsData) => {
    const newData = { ...formData, [field]: !formData[field] };
    setFormData(newData);
    onUpdate(newData);
  };

  const settings = [
    { id: "twoFactor", label: "احراز هویت دو مرحله‌ای" },
    { id: "autoClose", label: "بستن خودکار تیکت‌ها پس از ۷۲ ساعت بی‌فعالیت" },
    { id: "emailNotification", label: "اعلان ایمیل برای تیکت‌های جدید" },
  ];

  return (
    <div className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">امنیت</h3>
        <p className="text-xs text-gray-500 mt-0.5">تنظیمات امنیتی ورک‌اسپیس</p>
      </div>

      <div>
        {settings.map((setting) => (
          <div key={setting.id} className="flex items-center justify-between py-2.5 border-t border-[#59D8C3]/20 first:border-t-0">
            <span className="text-sm text-white">{setting.label}</span>
            <button
              onClick={() => handleToggle(setting.id as keyof SecuritySettingsData)}
              className="relative w-10 h-5.5 rounded-full transition-colors duration-200"
              style={{ backgroundColor: formData[setting.id as keyof SecuritySettingsData] ? "#59D8C3" : "#4B5563", height: "22px" }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                style={{ left: formData[setting.id as keyof SecuritySettingsData] ? "calc(100% - 18px)" : "2px" }}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}