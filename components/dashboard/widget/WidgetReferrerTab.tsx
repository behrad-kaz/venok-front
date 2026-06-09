// components/dashboard/widget/WidgetReferrerTab.tsx

"use client";

import { useState, useEffect } from "react";

interface ReferrerSettings {
  defaultDepartment: string;
  unspecifiedBehavior: "default-department" | "admin-queue";
  afterHoursBehavior: "save-and-wait" | "default-department";
}

interface WidgetReferrerTabProps {
  onSave: () => void;
  onReset: () => void;
  onHasChangesChange?: (hasChanges: boolean) => void;
}

const departments = [
  { id: "support", name: "پشتیبانی" },
  { id: "sales", name: "فروش" },
  { id: "financial", name: "مالی" },
  { id: "order-tracking", name: "پیگیری سفارش" },
];

const initialSettings: ReferrerSettings = {
  defaultDepartment: "",
  unspecifiedBehavior: "default-department",
  afterHoursBehavior: "save-and-wait",
};

export default function WidgetReferrerTab({
  onSave,
  onReset,
  onHasChangesChange,
}: WidgetReferrerTabProps) {
  const [settings, setSettings] = useState<ReferrerSettings>(initialSettings);

  // بررسی تغییرات
  useEffect(() => {
    const hasChanges =
      JSON.stringify(initialSettings) !== JSON.stringify(settings);
    onHasChangesChange?.(hasChanges);
  }, [settings, onHasChangesChange]);

  const updateSetting = <K extends keyof ReferrerSettings>(
    field: K,
    value: ReferrerSettings[K],
  ) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleReset = () => {
    setSettings(initialSettings);
    onReset();
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
        <h3 className="text-base font-bold text-white mb-5">
          مسیر ارجاع درخواست‌ها
        </h3>

        <div className="space-y-5">
          {/* دپارتمان پیش‌فرض برای موارد نامشخص */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              دپارتمان پیش‌فرض برای موارد نامشخص
            </label>
            <select
              value={settings.defaultDepartment}
              onChange={(e) =>
                updateSetting("defaultDepartment", e.target.value)
              }
              className="w-full px-4 py-2 rounded-xl bg-[#0D1B17] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2359D8C3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "left 1rem center",
                backgroundSize: "16px",
              }}
            >
              <option value="" className="bg-[#0D1B17] text-white">
                انتخاب دپارتمان
              </option>
              {departments.map((dept) => (
                <option
                  key={dept.id}
                  value={dept.id}
                  className="bg-[#0D1B17] text-white hover:bg-[#1A352B]"
                >
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* رفتار درخواست‌های بدون موضوع */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              رفتار درخواست‌های بدون موضوع
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer hover:border-[rgba(255,255,255,0.2)] transition-all">
                <input
                  type="radio"
                  name="unspecifiedBehavior"
                  className="mt-0.5"
                  checked={
                    settings.unspecifiedBehavior === "default-department"
                  }
                  onChange={() =>
                    updateSetting("unspecifiedBehavior", "default-department")
                  }
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    ارسال به دپارتمان پیش‌فرض
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    درخواست‌هایی که موضوع مشخصی ندارند به دپارتمان پیش‌فرض ارسال
                    می‌شوند
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer hover:border-[rgba(255,255,255,0.2)] transition-all">
                <input
                  type="radio"
                  name="unspecifiedBehavior"
                  className="mt-0.5"
                  checked={settings.unspecifiedBehavior === "admin-queue"}
                  onChange={() =>
                    updateSetting("unspecifiedBehavior", "admin-queue")
                  }
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    نگه‌داشتن در صف بررسی مدیرکل
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    درخواست‌ها در صف مدیرکل باقی می‌مانند تا مدیر آن‌ها را بررسی
                    و تخصیص دهد
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* رفتار خارج از ساعات پاسخ‌گویی */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              رفتار خارج از ساعات پاسخ‌گویی
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer hover:border-[rgba(255,255,255,0.2)] transition-all">
                <input
                  type="radio"
                  name="afterHoursBehavior"
                  className="mt-0.5"
                  checked={settings.afterHoursBehavior === "save-and-wait"}
                  onChange={() =>
                    updateSetting("afterHoursBehavior", "save-and-wait")
                  }
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    ثبت گفتگو و نمایش پیام انتظار
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    گفتگو ثبت می‌شود و به مشتری اطلاع داده می‌شود که در ساعت
                    کاری پاسخ داده خواهد شد
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer hover:border-[rgba(255,255,255,0.2)] transition-all">
                <input
                  type="radio"
                  name="afterHoursBehavior"
                  className="mt-0.5"
                  checked={settings.afterHoursBehavior === "default-department"}
                  onChange={() =>
                    updateSetting("afterHoursBehavior", "default-department")
                  }
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    ارسال به دپارتمان پیش‌فرض
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    درخواست به دپارتمان پیش‌فرض ارسال می‌شود و مانند درخواست
                    عادی پردازش می‌گردد
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* دکمه‌های اقدام */}
      <div className="flex items-center gap-3">
        <button
          onClick={onSave}
          className="px-6 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg transition-all"
        >
          ذخیره تنظیمات
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
        >
          بازگشت به پیش‌فرض
        </button>
      </div>
    </div>
  );
}
