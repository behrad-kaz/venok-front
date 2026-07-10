// components/dashboard/widget/WidgetAppearanceTab.tsx

"use client";

import { WidgetConfig } from './types';

interface WidgetAppearanceTabProps {
  config: WidgetConfig;
  onUpdate: <K extends keyof WidgetConfig>(field: K, value: WidgetConfig[K]) => void;
}

export default function WidgetAppearanceTab({ config, onUpdate }: WidgetAppearanceTabProps) {
  return (
    <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <h3 className="text-base font-bold text-white mb-5">تنظیمات ظاهری ویجت</h3>
      
      <div className="space-y-5">
        {/* رنگ اصلی */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">رنگ اصلی ویجت</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={config.primaryColor}
              onChange={(e) => onUpdate('primaryColor', e.target.value)}
              className="w-12 h-12 rounded-xl border border-[rgba(255,255,255,0.1)] cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={config.primaryColor}
              onChange={(e) => onUpdate('primaryColor', e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
              dir="ltr"
            />
          </div>
        </div>

        {/* لوگو */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">آدرس لوگو</label>
          <input
            type="text"
            value={config.logoUrl || ''}
            onChange={(e) => onUpdate('logoUrl', e.target.value || null)}
            placeholder="https://example.com/logo.png"
            className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            dir="ltr"
          />
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
                onClick={() => onUpdate('buttonPosition', option.id as "bottom-right" | "bottom-left")}
                className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                  config.buttonPosition === option.id
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
              { id: "sm", label: "کوچک" },
              { id: "md", label: "متوسط" },
              { id: "lg", label: "بزرگ" },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => onUpdate('buttonSize', option.id as "sm" | "md" | "lg")}
                className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                  config.buttonSize === option.id
                    ? "bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] border-[#59D8C3]"
                    : "bg-[rgba(255,255,255,0.03)] text-gray-500 border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}