// components/dashboard/widget/WidgetAppearanceTab.tsx

"use client";

import { WidgetAppearance } from "./types";

interface WidgetAppearanceTabProps {
  appearance: WidgetAppearance;
  onAppearanceChange: (appearance: WidgetAppearance) => void;
  onSave: () => void;
  onReset: () => void;
}

export default function WidgetAppearanceTab({ appearance, onAppearanceChange, onSave, onReset }: WidgetAppearanceTabProps) {
  const updateField = <K extends keyof WidgetAppearance>(field: K, value: WidgetAppearance[K]) => {
    onAppearanceChange({ ...appearance, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
        <h3 className="text-base font-bold text-white mb-5">تنظیمات ظاهری ویجت</h3>
        
        <div className="space-y-5">
          {/* رنگ اصلی ویجت */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">رنگ اصلی ویجت</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={appearance.primaryColor}
                onChange={(e) => updateField("primaryColor", e.target.value)}
                className="w-12 h-12 rounded-xl border border-[rgba(255,255,255,0.1)] cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={appearance.primaryColor}
                onChange={(e) => updateField("primaryColor", e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
                dir="ltr"
              />
            </div>
          </div>

          {/* موقعیت دکمه */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">موقعیت دکمه</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "bottom-right", label: "پایین راست" },
                { id: "bottom-left", label: "پایین چپ" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => updateField("position", option.id as "bottom-right" | "bottom-left")}
                  className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                    appearance.position === option.id
                      ? "bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] border-[#59D8C3]"
                      : "bg-[rgba(255,255,255,0.03)] text-gray-500 border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* حالت دکمه */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">حالت دکمه</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "circle", label: "دایره‌ای" },
                { id: "capsule", label: "کپسولی" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => updateField("buttonStyle", option.id as "circle" | "capsule")}
                  className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                    appearance.buttonStyle === option.id
                      ? "bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] border-[#59D8C3]"
                      : "bg-[rgba(255,255,255,0.03)] text-gray-500 border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* اندازه دکمه */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">اندازه دکمه</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "small", label: "کوچک" },
                { id: "medium", label: "متوسط" },
                { id: "large", label: "بزرگ" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => updateField("buttonSize", option.id as "small" | "medium" | "large")}
                  className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                    appearance.buttonSize === option.id
                      ? "bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] border-[#59D8C3]"
                      : "bg-[rgba(255,255,255,0.03)] text-gray-500 border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* متن روی دکمه */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">متن روی دکمه</label>
            <input
              type="text"
              value={appearance.buttonText}
              onChange={(e) => updateField("buttonText", e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            />
          </div>

          {/* تنظیمات نمایش */}
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer">
              <span className="text-sm font-medium text-white">نمایش لوگوی شرکت</span>
              <button
                type="button"
                onClick={() => updateField("showLogo", !appearance.showLogo)}
                className={`relative w-11 h-6 rounded-full transition-all ${appearance.showLogo ? "bg-[#59D8C3]" : "bg-gray-600"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${appearance.showLogo ? "right-0.5" : "left-0.5"}`} />
              </button>
            </label>
            <label className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer">
              <span className="text-sm font-medium text-white">نمایش آیکن چت</span>
              <button
                type="button"
                onClick={() => updateField("showChatIcon", !appearance.showChatIcon)}
                className={`relative w-11 h-6 rounded-full transition-all ${appearance.showChatIcon ? "bg-[#59D8C3]" : "bg-gray-600"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${appearance.showChatIcon ? "right-0.5" : "left-0.5"}`} />
              </button>
            </label>
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
          onClick={onReset}
          className="px-6 py-3 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
        >
          بازگشت به پیش‌فرض
        </button>
      </div>
    </div>
  );
}