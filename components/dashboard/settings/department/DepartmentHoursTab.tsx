"use client";

import { WorkingHours } from "./types";

interface DepartmentHoursTabProps {
  workingHours: WorkingHours;
  onWorkingHoursChange: (hours: WorkingHours) => void;
}

const dayNames: Record<string, string> = {
  saturday: "شنبه",
  sunday: "یکشنبه",
  monday: "دوشنبه",
  tuesday: "سه‌شنبه",
  wednesday: "چهارشنبه",
  thursday: "پنجشنبه",
  friday: "جمعه",
};

export default function DepartmentHoursTab({
  workingHours,
  onWorkingHoursChange,
}: DepartmentHoursTabProps) {
  const toggleUseWorkspaceHours = () => {
    onWorkingHoursChange({
      ...workingHours,
      useWorkspaceHours: !workingHours.useWorkspaceHours,
    });
  };

  const toggleWorkingDay = (day: string) => {
    if (workingHours.useWorkspaceHours) return;
    onWorkingHoursChange({
      ...workingHours,
      workingDays: {
        ...workingHours.workingDays,
        [day]:
          !workingHours.workingDays[
            day as keyof typeof workingHours.workingDays
          ],
      },
    });
  };

  const updateStartTime = (value: string) => {
    if (workingHours.useWorkspaceHours) return;
    onWorkingHoursChange({ ...workingHours, startTime: value });
  };

  const updateEndTime = (value: string) => {
    if (workingHours.useWorkspaceHours) return;
    onWorkingHoursChange({ ...workingHours, endTime: value });
  };

  const updateTimezone = (value: string) => {
    if (workingHours.useWorkspaceHours) return;
    onWorkingHoursChange({ ...workingHours, timezone: value });
  };

  const updateOutOfHoursMessage = (value: string) => {
    if (workingHours.useWorkspaceHours) return;
    onWorkingHoursChange({ ...workingHours, outOfHoursMessage: value });
  };

  const activeDaysCount = Object.values(workingHours.workingDays).filter(
    Boolean,
  ).length;
  const isDisabled = workingHours.useWorkspaceHours;

  return (
    <div className="space-y-6">
      {/* گزینه استفاده از ساعات کاری Workspace */}
      <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm font-medium text-white">
              استفاده از ساعات کاری Workspace
            </p>
            <p className="text-xs text-gray-500 mt-1">
              از ساعات کاری تنظیم‌شده در سطح Workspace استفاده شود
            </p>
          </div>
          <button
            type="button"
            onClick={toggleUseWorkspaceHours}
            className={`relative w-11 h-6 rounded-full transition-all ${workingHours.useWorkspaceHours ? "bg-[#59D8C3]" : "bg-gray-600"}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${workingHours.useWorkspaceHours ? "right-0.5" : "left-0.5"}`}
            />
          </button>
        </label>
      </div>

      {/* بخش ساعات پاسخگویی دپارتمان */}
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
        <h3 className="text-base font-bold text-white mb-2">
          ساعات پاسخگویی دپارتمان
        </h3>

        <div className="space-y-5">
          {/* روزهای کاری */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              روزهای کاری
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              {Object.entries(workingHours.workingDays).map(
                ([day, isActive]) => (
                  <button
                    key={day}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => toggleWorkingDay(day)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F]"
                        : "bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)]"
                    } ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:border-[rgba(255,255,255,0.2)] hover:text-white"}`}
                  >
                    {dayNames[day]}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* ساعت شروع و پایان */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                ساعت شروع پاسخگویی
              </label>
              <input
                type="time"
                value={workingHours.startTime}
                onChange={(e) => updateStartTime(e.target.value)}
                disabled={isDisabled}
                className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                ساعت پایان پاسخگویی
              </label>
              <input
                type="time"
                value={workingHours.endTime}
                onChange={(e) => updateEndTime(e.target.value)}
                disabled={isDisabled}
                className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                dir="ltr"
              />
            </div>
          </div>

          {/* منطقه زمانی */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              منطقه زمانی
            </label>
            <select
              value={workingHours.timezone}
              onChange={(e) => updateTimezone(e.target.value)}
              disabled={isDisabled}
              className="w-full px-4 py-2 rounded-xl bg-[#0D1B17] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2359D8C3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "left 1rem center",
                backgroundSize: "16px",
              }}
            >
              <option
                value="Asia/Tehran"
                className="bg-[#0D1B17] text-white hover:bg-[#1A352B]"
              >
                تهران (UTC+3:30)
              </option>
              <option
                value="Asia/Dubai"
                className="bg-[#0D1B17] text-white hover:bg-[#1A352B]"
              >
                دبی (UTC+4:00)
              </option>
              <option
                value="Europe/Istanbul"
                className="bg-[#0D1B17] text-white hover:bg-[#1A352B]"
              >
                استانبول (UTC+3:00)
              </option>
              <option
                value="Europe/London"
                className="bg-[#0D1B17] text-white hover:bg-[#1A352B]"
              >
                لندن (UTC+0:00)
              </option>
              <option
                value="America/New_York"
                className="bg-[#0D1B17] text-white hover:bg-[#1A352B]"
              >
                نیویورک (UTC-5:00)
              </option>
            </select>
          </div>

          {/* پیام خارج از ساعات کاری */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              پیام عمومی خارج از ساعات کاری
            </label>
            <textarea
              rows={3}
              value={workingHours.outOfHoursMessage}
              onChange={(e) => updateOutOfHoursMessage(e.target.value)}
              disabled={isDisabled}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
