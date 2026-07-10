// components/dashboard/widget/WidgetFormTab.tsx

"use client";

import { WidgetConfig, Department } from './types';

interface WidgetFormTabProps {
  config: WidgetConfig;
  onUpdate: <K extends keyof WidgetConfig>(field: K, value: WidgetConfig[K]) => void;
  onToggleDepartment: (departmentId: number) => void;
}

export default function WidgetFormTab({ config, onUpdate, onToggleDepartment }: WidgetFormTabProps) {
  return (
    <div className="space-y-6">
      {/* تنظیمات فرم */}
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
        <h3 className="text-base font-bold text-white mb-5">تنظیمات فرم شروع گفتگو</h3>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white mb-2">عنوان فرم</label>
            <input
              type="text"
              value={config.formTitle}
              onChange={(e) => onUpdate('formTitle', e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">متن توضیحی فرم</label>
            <textarea
              rows={2}
              value={config.formDescription}
              onChange={(e) => onUpdate('formDescription', e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">متن placeholder شماره همراه</label>
            <input
              type="text"
              value={config.phonePlaceholder}
              onChange={(e) => onUpdate('phonePlaceholder', e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">متن دکمه شروع گفتگو</label>
            <input
              type="text"
              value={config.submitButtonText}
              onChange={(e) => onUpdate('submitButtonText', e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">پیام موفقیت</label>
            <input
              type="text"
              value={config.successMessage}
              onChange={(e) => onUpdate('successMessage', e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">متن حریم خصوصی</label>
            <input
              type="text"
              value={config.privacyText}
              onChange={(e) => onUpdate('privacyText', e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            />
          </div>

          {/* تنظیمات نمایش فیلدها */}
          <div className="pt-3 border-t border-[rgba(255,255,255,0.1)] space-y-3">
            <h4 className="text-sm font-medium text-white mb-3">تنظیمات فیلدها</h4>

            <label className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer">
              <span className="text-sm font-medium text-white">نمایش انتخاب دپارتمان</span>
              <button
                type="button"
                onClick={() => onUpdate('showDepartmentSelect', !config.showDepartmentSelect)}
                className={`relative w-11 h-6 rounded-full transition-all ${config.showDepartmentSelect ? "bg-[#59D8C3]" : "bg-gray-600"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${config.showDepartmentSelect ? "right-0.5" : "left-0.5"}`} />
              </button>
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer">
              <span className="text-sm font-medium text-white">نمایش فیلد توضیحات</span>
              <button
                type="button"
                onClick={() => onUpdate('showDescriptionField', !config.showDescriptionField)}
                className={`relative w-11 h-6 rounded-full transition-all ${config.showDescriptionField ? "bg-[#59D8C3]" : "bg-gray-600"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${config.showDescriptionField ? "right-0.5" : "left-0.5"}`} />
              </button>
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer">
              <span className="text-sm font-medium text-white">توضیحات اجباری است</span>
              <button
                type="button"
                onClick={() => onUpdate('descriptionRequired', !config.descriptionRequired)}
                className={`relative w-11 h-6 rounded-full transition-all ${config.descriptionRequired ? "bg-[#59D8C3]" : "bg-gray-600"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${config.descriptionRequired ? "right-0.5" : "left-0.5"}`} />
              </button>
            </label>
          </div>
        </div>
      </div>

      {/* دپارتمان‌ها */}
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
        <h3 className="text-base font-bold text-white mb-4">دپارتمان‌های پشتیبانی</h3>
        <p className="text-sm text-gray-500 mb-4">
          دپارتمان‌های فعال در ویجت نمایش داده می‌شوند.
        </p>

        <div className="space-y-3">
          {config.departments.length === 0 ? (
            <p className="text-sm text-gray-500">هیچ دپارتمانی یافت نشد</p>
          ) : (
            config.departments.map((dept) => (
              <div
                key={dept.id}
                className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: dept.color || '#59D8C3' }}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{dept.name}</p>
                    {dept.description && (
                      <p className="text-xs text-gray-500">{dept.description}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleDepartment(dept.id)}
                  className={`relative w-11 h-6 rounded-full transition-all ${dept.isActive ? "bg-[#59D8C3]" : "bg-gray-600"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${dept.isActive ? "right-0.5" : "left-0.5"}`} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}