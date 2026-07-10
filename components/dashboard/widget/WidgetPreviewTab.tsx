// components/dashboard/widget/WidgetPreviewTab.tsx

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { WidgetConfig } from './types';

interface WidgetPreviewTabProps {
  config: WidgetConfig;
}

type PreviewMode = "desktop" | "mobile";
type PreviewState = "button" | "form" | "success";

export default function WidgetPreviewTab({ config }: WidgetPreviewTabProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [previewState, setPreviewState] = useState<PreviewState>("button");

  const primaryColor = config.primaryColor || '#14b8a6';
  const companyName = config.companyName || 'پشتیبان‌یار';
  const logoUrl = config.logoUrl;
  const formTitle = config.formTitle || 'چطور می‌تونیم کمکتون کنیم؟';
  const formDescription = config.formDescription || 'موضوع گفتگو را انتخاب کنید تا شما را به تیم مناسب وصل کنیم.';
  const phonePlaceholder = config.phonePlaceholder || 'شماره همراه خود را وارد کنید';
  const submitButtonText = config.submitButtonText || 'شروع گفتگو';
  const privacyText = config.privacyText || 'با ثبت شماره، لینک گفتگو از طریق پیامک برای شما ارسال می‌شود.';
  const showDepartmentSelect = config.showDepartmentSelect !== undefined ? config.showDepartmentSelect : true;
  const showDescriptionField = config.showDescriptionField !== undefined ? config.showDescriptionField : true;
  const descriptionRequired = config.descriptionRequired || false;
  const departments = config.departments || [];
  const buttonSize = config.buttonSize || 'md';
  const buttonPosition = config.buttonPosition || 'bottom-right';

  // محاسبه اندازه دکمه
  const getButtonSize = () => {
    switch (buttonSize) {
      case 'sm': return 'w-14 h-14';
      case 'lg': return 'w-20 h-20';
      default: return 'w-16 h-16';
    }
  };

  // موقعیت دکمه
  const getPositionClass = () => {
    return buttonPosition === 'bottom-right' ? 'right-6' : 'left-6';
  };

  // استایل دایره پالسی
  const pulseRingStyle = {
    animation: 'pulseRing 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  };

  // ✅ تعیین عرض فرم بر اساس حالت
  const getFormWidth = () => {
    if (previewMode === 'mobile') {
      return 'w-[220px]'; // عرض کمتر برای موبایل
    }
    return 'w-[380px]'; // عرض معمولی برای دسکتاپ
  };

  // ✅ تعیین padding فرم بر اساس حالت
  const getFormPadding = () => {
    if (previewMode === 'mobile') {
      return 'p-2'; // padding کمتر برای موبایل
    }
    return 'p-5'; // padding معمولی برای دسکتاپ
  };

  // ✅ تعیین اندازه فونت‌ها بر اساس حالت
  const getTextSize = () => {
    if (previewMode === 'mobile') {
      return {
        title: 'text-xs',
        description: 'text-[6px]',
        label: 'text-[6px]',
        input: 'text-xs',
        button: 'text-xs',
        privacy: 'text-[9px]',
      };
    }
    return {
      title: 'text-base',
      description: 'text-xs',
      label: 'text-sm',
      input: 'text-sm',
      button: 'text-sm',
      privacy: 'text-[10px]',
    };
  };

  const textSize = getTextSize();

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
        {/* هدر */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">پیش‌نمایش ویجت</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode("desktop")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                previewMode === "desktop"
                  ? "bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F]"
                  : "bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white"
              }`}
            >
              دسکتاپ
            </button>
            <button
              onClick={() => setPreviewMode("mobile")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                previewMode === "mobile"
                  ? "bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F]"
                  : "bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white"
              }`}
            >
              موبایل
            </button>
          </div>
        </div>

        {/* دکمه‌های حالت */}
        <div className="flex items-center gap-3 mb-5">
          {(["button", "form", "success"] as PreviewState[]).map((state) => (
            <button
              key={state}
              onClick={() => setPreviewState(state)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                previewState === state
                  ? "bg-[rgba(89,216,195,0.12)] text-[#59D8C3] border border-[rgba(89,216,195,0.3)]"
                  : "bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white"
              }`}
            >
              {state === "button" && "دکمه"}
              {state === "form" && "فرم"}
              {state === "success" && "موفقیت"}
            </button>
          ))}
        </div>

        {/* محفظه پیش‌نمایش */}
        <div 
          className={` rounded-2xl bg-gradient-to-br from-[#0a3d35] to-[#050f0d] border border-[rgba(255,255,255,0.1)] overflow-hidden relative ${
            previewMode === "mobile" ? "mx-auto w-[300px]" : "w-full"
          }`}
          style={{ height: previewMode === "mobile" ? "600px" : "500px" }}
        >
          {/* دکمه ویجت */}
          {previewState === "button" && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={`absolute bottom-6 ${getPositionClass()} ${getButtonSize()} rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform z-10`}
              style={{ backgroundColor: primaryColor }}
            >
              <MessageCircle className={`${previewMode === 'mobile' ? 'w-5 h-5' : 'w-6 h-6'} text-white`} strokeWidth={2} />
              
              <div 
                className="absolute inset-0 rounded-full -z-10"
                style={{
                  ...pulseRingStyle,
                  backgroundColor: primaryColor,
                  opacity: 0.5,
                }}
              />
            </motion.button>
          )}

          {/* فرم شروع گفتگو */}
          {previewState === "form" && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`absolute bottom-6 ${getPositionClass()} ${getFormWidth()} max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden`}
            >
              {/* هدر فرم */}
              <div className={`${getFormPadding()} text-white relative`} style={{ backgroundColor: primaryColor }}>
                <div className="flex items-center gap-3 mb-3">
                  {logoUrl ? (
                    <img src={logoUrl} alt={companyName} className={`${previewMode === 'mobile' ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg object-contain bg-white/10 p-1`} />
                  ) : (
                    <div className={`${previewMode === 'mobile' ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-white/10 flex items-center justify-center text-white font-bold ${previewMode === 'mobile' ? 'text-base' : 'text-lg'}`}>
                      {companyName.charAt(0)}
                    </div>
                  )}
                  <h3 className={`font-bold ${previewMode === 'mobile' ? 'text-sm' : 'text-base'} truncate`}>{companyName}</h3>
                </div>
                <h4 className={`font-bold ${previewMode === 'mobile' ? 'text-base' : 'text-lg'}`}>{formTitle}</h4>
                <p className={`${previewMode === 'mobile' ? 'text-[10px]' : 'text-sm'} opacity-90 mt-1`}>{formDescription}</p>
              </div>

              {/* فرم */}
              <div className={`${getFormPadding()} `}>
                {showDepartmentSelect && departments.length > 0 && (
                  <div>
                    <label className={`block ${textSize.label} font-medium text-gray-700 mb-1`}>
                      دپارتمان <span className="text-red-500 mr-1">*</span>
                    </label>
                    <select className={`w-full ${previewMode === 'mobile' ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'} rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30`}>
                      <option value="">انتخاب کنید</option>
                      {departments.filter(d => d.isActive).map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className={`block ${textSize.label} font-medium text-gray-700 mb-1`}>
                    شماره همراه <span className="text-red-500 mr-1">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder={phonePlaceholder}
                    className={`w-full ${previewMode === 'mobile' ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'} rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30`}
                    dir="ltr"
                  />
                </div>

                {showDescriptionField && (
                  <div>
                    <label className={`block ${textSize.label} font-medium text-gray-700 mb-1`}>
                      توضیحات {descriptionRequired && <span className="text-red-500 mr-1">*</span>}
                    </label>
                    <textarea
                      placeholder="توضیحات بیشتر..."
                      rows={previewMode === 'mobile' ? 2 : 2}
                      className={`w-full ${previewMode === 'mobile' ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'} rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none`}
                    />
                  </div>
                )}

                <button
                  className={`w-full ${previewMode === 'mobile' ? 'py-2 text-xs' : 'py-3 text-sm'} rounded-xl text-white font-bold transition-all hover:opacity-90`}
                  style={{ backgroundColor: primaryColor }}
                >
                  {submitButtonText}
                </button>

                <p className={`${textSize.privacy} text-gray-400 text-center`}>{privacyText}</p>
              </div>
            </motion.div>
          )}

          {/* حالت موفقیت */}
          {previewState === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`absolute bottom-6 ${getPositionClass()} ${getFormWidth()} max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden`}
            >
              <div className={`${getFormPadding()} text-center`}>
                <div className={`${previewMode === 'mobile' ? 'w-12 h-12' : 'w-16 h-16'} rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4`}>
                  <svg width={previewMode === 'mobile' ? "24" : "32"} height={previewMode === 'mobile' ? "24" : "32"} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className={`${previewMode === 'mobile' ? 'text-sm' : 'text-base'} font-medium text-gray-900 mb-2`}>
                  {config.successMessage || 'لینک گفتگو برای شما پیامک شد.'}
                </p>
                <p className={`${previewMode === 'mobile' ? 'text-[10px]' : 'text-sm'} text-gray-500`}>
                  لطفاً صندوق پیامک خود را بررسی کنید.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* اضافه کردن استایل keyframe برای pulseRing */}
      <style jsx>{`
        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}