// components/dashboard/workspace-settings/WorkspaceHoursTab.tsx

"use client";

import { WorkingHours } from "./types";

interface WorkspaceHoursTabProps {
  hours: WorkingHours;
  onHoursChange: (hours: WorkingHours) => void;
}

// ✅ ترتیب صحیح روزها از شنبه شروع می‌شود
const dayNames: Record<string, string> = {
  saturday: "شنبه",
  sunday: "یکشنبه",
  monday: "دوشنبه",
  tuesday: "سه‌شنبه",
  wednesday: "چهارشنبه",
  thursday: "پنجشنبه",
  friday: "جمعه",
};

// ✅ آرایه مرتب شده از کلیدها
const orderedDays = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];

// ✅ لیست کامل مناطق زمانی
const timezones = [
  { value: "Asia/Tehran", label: "تهران (UTC+3:30)" },
  { value: "Asia/Dubai", label: "دبی (UTC+4:00)" },
  { value: "Europe/Istanbul", label: "استانبول (UTC+3:00)" },
  { value: "Europe/London", label: "لندن (UTC+0:00)" },
  { value: "America/New_York", label: "نیویورک (UTC-5:00)" },
  { value: "America/Los_Angeles", label: "لس آنجلس (UTC-8:00)" },
  { value: "Asia/Tokyo", label: "توکیو (UTC+9:00)" },
  { value: "Australia/Sydney", label: "سیدنی (UTC+11:00)" },
];

export default function WorkspaceHoursTab({ hours, onHoursChange }: WorkspaceHoursTabProps) {
  const toggleWorkingDay = (day: string) => {
    onHoursChange({
      ...hours,
      workingDays: { ...hours.workingDays, [day]: !hours.workingDays[day as keyof typeof hours.workingDays] },
    });
  };

  return (
    <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <h3 className="text-base font-bold text-white mb-2">ساعات کاری Workspace</h3>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white mb-3">روزهای کاری</label>
          <div className="grid grid-cols-7 gap-2">
            {orderedDays.map((day) => {
              const isActive = hours.workingDays[day as keyof typeof hours.workingDays];
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWorkingDay(day)}
                  className={`px-2 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F]"
                      : "bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
                  }`}
                >
                  {dayNames[day]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-white mb-2">ساعت شروع پاسخگویی</label>
            <input
              type="time"
              value={hours.startTime}
              onChange={(e) => onHoursChange({ ...hours, startTime: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">ساعت پایان پاسخگویی</label>
            <input
              type="time"
              value={hours.endTime}
              onChange={(e) => onHoursChange({ ...hours, endTime: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">منطقه زمانی</label>
          <select
            value={hours.timezone}
            onChange={(e) => onHoursChange({ ...hours, timezone: e.target.value })}
            className="w-full px-4 py-2 rounded-xl bg-[#0D1B17] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all cursor-pointer appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2359D8C3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "left 1rem center",
              backgroundSize: "16px",
            }}
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value} className="bg-[#0D1B17] text-white">
                {tz.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">این مقدار با تنظیمات Workspace هماهنگ است</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">پیام عمومی خارج از ساعات کاری</label>
          <textarea
            rows={3}
            value={hours.outOfHoursMessage}
            onChange={(e) => onHoursChange({ ...hours, outOfHoursMessage: e.target.value })}
            className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
}