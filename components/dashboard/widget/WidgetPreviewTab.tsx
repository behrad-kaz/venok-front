// components/dashboard/widget/WidgetPreviewTab.tsx

"use client";

import { useState } from "react";

interface WidgetPreviewTabProps {
  primaryColor?: string;
  buttonText?: string;
  buttonStyle?: "circle" | "capsule";
  buttonSize?: "small" | "medium" | "large";
}

type PreviewMode = "desktop" | "mobile";
type PreviewState = "button" | "form" | "success" | "error";

export default function WidgetPreviewTab({ 
  primaryColor = "#59d8c3",
  buttonText = "گفتگو با پشتیبانی",
  buttonStyle = "capsule",
  buttonSize = "medium"
}: WidgetPreviewTabProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [previewState, setPreviewState] = useState<PreviewState>("button");

  // محاسبه ارتفاع دکمه بر اساس اندازه
  const getButtonHeight = () => {
    switch (buttonSize) {
      case "small": return "48px";
      case "large": return "72px";
      default: return "56px";
    }
  };

  // محاسبه padding دکمه بر اساس اندازه و حالت
  const getButtonPadding = () => {
    switch (buttonSize) {
      case "small": return "0 16px";
      case "large": return "0 32px";
      default: return "0 24px";
    }
  };

  // محاسبه عرض دکمه در حالت دایره
  const getButtonWidth = () => {
    if (buttonStyle === "circle") {
      return getButtonHeight(); // عرض برابر با ارتفاع برای شکل دایره
    }
    return "auto";
  };

  const getButtonRadius = () => {
    return buttonStyle === "circle" ? "50%" : "32px";
  };

  const buttonHeight = getButtonHeight();
  const buttonWidth = getButtonWidth();
  const buttonRadius = getButtonRadius();
  const buttonPadding = getButtonPadding();

  // تعیین اینکه آیا متن نمایش داده شود (در حالت دایره، متن نمایش داده نمی‌شود)
  const showText = buttonStyle !== "circle";

  return (
    <div className="space-y-6">
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
          {(["button", "form", "success", "error"] as PreviewState[]).map((state) => (
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
              {state === "error" && "خطا"}
            </button>
          ))}
        </div>

        {/* محفظه پیش‌نمایش - حالت دسکتاپ */}
        {previewMode === "desktop" && (
          <div 
            className="rounded-2xl bg-gradient-to-br from-[#0a3d35] to-[#050f0d] border border-[rgba(255,255,255,0.1)] overflow-hidden"
            style={{ height: "500px", position: "relative" }}
          >
            {previewState === "button" && (
              <button 
                style={{ 
                  position: "absolute",
                  left: "24px",
                  bottom: "24px",
                  backgroundColor: primaryColor,
                  height: buttonHeight,
                  width: buttonWidth,
                  borderRadius: buttonRadius,
                  padding: buttonPadding,
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  transition: "transform 0.2s",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <div className="flex items-center gap-2 text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {showText && (
                    <span className="font-medium text-sm whitespace-nowrap">{buttonText}</span>
                  )}
                </div>
              </button>
            )}

            {/* فرم شروع گفتگو - بدون تغییر */}
            {previewState === "form" && (
              <div style={{ position: "absolute", left: "24px", bottom: "24px", width: "320px" }} className="rounded-2xl bg-[rgba(9,22,18,0.98)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-[rgba(255,255,255,0.1)]" style={{ backgroundColor: primaryColor + "15" }}>
                  <p className="text-sm font-bold text-white">چطور می‌تونیم کمکتون کنیم؟</p>
                  <p className="text-xs text-gray-400 mt-1">موضوع گفتگو را انتخاب کنید تا شما را به تیم مناسب وصل کنیم.</p>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">موضوع گفتگو</label>
                    <select className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm">
                      <option>مشکل پرداخت</option>
                      <option>سوال قبل از خرید</option>
                      <option>پیگیری سفارش</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">شماره همراه</label>
                    <input type="tel" placeholder="شماره همراه خود را وارد کنید" className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm placeholder:text-gray-500" />
                  </div>
                  <button className="w-full py-2 rounded-lg text-sm font-medium transition-all" style={{ backgroundColor: primaryColor, color: "#06110F" }}>
                    شروع گفتگو
                  </button>
                  <p className="text-[10px] text-gray-500 text-center">با ارسال شماره همراه، شرایط و قوانین را می‌پذیرید.</p>
                </div>
              </div>
            )}

            {/* موفقیت - بدون تغییر */}
            {previewState === "success" && (
              <div style={{ position: "absolute", left: "24px", bottom: "24px", width: "320px" }} className="rounded-2xl bg-[rgba(9,22,18,0.98)] backdrop-blur-xl border border-[rgba(91,224,168,0.3)] shadow-2xl overflow-hidden">
                <div className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-[rgba(91,224,168,0.15)] flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5be0a8" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white">لینک گفتگو برای شما پیامک شد.</p>
                  <p className="text-xs text-gray-500 mt-2">لطفاً صندوق پیامک خود را بررسی کنید.</p>
                </div>
              </div>
            )}

            {/* خطا - بدون تغییر */}
            {previewState === "error" && (
              <div style={{ position: "absolute", left: "24px", bottom: "24px", width: "320px" }} className="rounded-2xl bg-[rgba(9,22,18,0.98)] backdrop-blur-xl border border-[rgba(255,107,107,0.3)] shadow-2xl overflow-hidden">
                <div className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-[rgba(255,107,107,0.15)] flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white">شماره همراه وارد شده معتبر نیست.</p>
                  <p className="text-xs text-gray-500 mt-2">لطفاً شماره را تصحیح کنید و دوباره تلاش کنید.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* محفظه پیش‌نمایش - حالت موبایل */}
        {previewMode === "mobile" && (
          <div 
            className="rounded-2xl bg-gradient-to-br from-[#0a3d35] to-[#050f0d] border border-[rgba(255,255,255,0.1)] overflow-hidden mx-auto"
            style={{ height: "600px", width: "375px", position: "relative" }}
          >
            {previewState === "button" && (
              <button 
                style={{ 
                  position: "absolute",
                  left: "24px",
                  bottom: "24px",
                  backgroundColor: primaryColor,
                  height: buttonHeight,
                  width: buttonWidth,
                  borderRadius: buttonRadius,
                  padding: buttonPadding,
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  transition: "transform 0.2s",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <div className="flex items-center gap-2 text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {showText && (
                    <span className="font-medium text-sm whitespace-nowrap">{buttonText}</span>
                  )}
                </div>
              </button>
            )}

            {/* فرم شروع گفتگو - بدون تغییر */}
            {previewState === "form" && (
              <div style={{ position: "absolute", left: "24px", bottom: "24px", width: "320px" }} className="rounded-2xl bg-[rgba(9,22,18,0.98)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-[rgba(255,255,255,0.1)]" style={{ backgroundColor: primaryColor + "15" }}>
                  <p className="text-sm font-bold text-white">چطور می‌تونیم کمکتون کنیم؟</p>
                  <p className="text-xs text-gray-400 mt-1">موضوع گفتگو را انتخاب کنید تا شما را به تیم مناسب وصل کنیم.</p>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">موضوع گفتگو</label>
                    <select className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm">
                      <option>مشکل پرداخت</option>
                      <option>سوال قبل از خرید</option>
                      <option>پیگیری سفارش</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">شماره همراه</label>
                    <input type="tel" placeholder="شماره همراه خود را وارد کنید" className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm placeholder:text-gray-500" />
                  </div>
                  <button className="w-full py-2 rounded-lg text-sm font-medium transition-all" style={{ backgroundColor: primaryColor, color: "#06110F" }}>
                    شروع گفتگو
                  </button>
                  <p className="text-[10px] text-gray-500 text-center">با ارسال شماره همراه، شرایط و قوانین را می‌پذیرید.</p>
                </div>
              </div>
            )}

            {/* موفقیت - بدون تغییر */}
            {previewState === "success" && (
              <div style={{ position: "absolute", left: "24px", bottom: "24px", width: "320px" }} className="rounded-2xl bg-[rgba(9,22,18,0.98)] backdrop-blur-xl border border-[rgba(91,224,168,0.3)] shadow-2xl overflow-hidden">
                <div className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-[rgba(91,224,168,0.15)] flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5be0a8" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white">لینک گفتگو برای شما پیامک شد.</p>
                  <p className="text-xs text-gray-500 mt-2">لطفاً صندوق پیامک خود را بررسی کنید.</p>
                </div>
              </div>
            )}

            {/* خطا - بدون تغییر */}
            {previewState === "error" && (
              <div style={{ position: "absolute", left: "24px", bottom: "24px", width: "320px" }} className="rounded-2xl bg-[rgba(9,22,18,0.98)] backdrop-blur-xl border border-[rgba(255,107,107,0.3)] shadow-2xl overflow-hidden">
                <div className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-[rgba(255,107,107,0.15)] flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white">شماره همراه وارد شده معتبر نیست.</p>
                  <p className="text-xs text-gray-500 mt-2">لطفاً شماره را تصحیح کنید و دوباره تلاش کنید.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}