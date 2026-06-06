// components/onboarding/steps/Step1CompanyInfo.tsx
"use client";

import { useState } from "react";
import { MessageCircle, Image, Phone, Mail, Globe } from "lucide-react";
import { CompanyData } from "../types";

interface Step1CompanyInfoProps {
  formData: CompanyData;
  logoPreview: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Step1CompanyInfo({
  formData,
  logoPreview,
  onInputChange,
  onLogoChange,
}: Step1CompanyInfoProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            نام شرکت <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={onInputChange}
            className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
            placeholder="مثال: آژانس سفر نمونه"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">لوگوی شرکت</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <Image className="w-6 h-6 text-gray-500" />
              )}
            </div>
            <label className="px-4 py-2 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] text-white border border-[rgba(255,255,255,0.1)] hover:border-[#59D8C3] transition-colors cursor-pointer">
              انتخاب فایل
              <input type="file" accept="image/*" onChange={onLogoChange} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1.5">فرمت PNG یا JPG با حداکثر حجم ۲ مگابایت</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              شماره تماس پشتیبانی <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onInputChange}
              className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
              placeholder="۰۲۱۱۲۳۴۵۶۷۸"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              ایمیل پشتیبانی <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onInputChange}
              className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
              placeholder="support@example.com"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">دامنه سایت شرکت</label>
          <input
            type="text"
            name="domain"
            value={formData.domain}
            onChange={onInputChange}
            className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
            placeholder="example.com"
            dir="ltr"
          />
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] sticky top-6">
          <h4 className="text-sm font-semibold text-white mb-3">پیش‌نمایش</h4>
          <p className="text-xs text-gray-500 mb-4">
            این اطلاعات در ویجت سایت و صفحه ورود مشتریان نمایش داده می‌شود.
          </p>
          <div className="p-4 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(89,216,195,0.1)] border border-[#59D8C3] flex items-center justify-center overflow-hidden flex-shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                ) : (
                  <MessageCircle className="w-5 h-5 text-[#59D8C3]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {formData.companyName || "نام شرکت"}
                </p>
                <p className="text-[10px] text-gray-500">همیشه در دسترس شما هستیم</p>
              </div>
            </div>
            <div className="space-y-2 text-[10px] text-gray-500">
              {formData.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-[#59D8C3]" />
                  <span>{formData.phone}</span>
                </div>
              )}
              {formData.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-[#59D8C3]" />
                  <span>{formData.email}</span>
                </div>
              )}
              {formData.domain && (
                <div className="flex items-center gap-2">
                  <Globe className="w-3 h-3 text-[#59D8C3]" />
                  <span>{formData.domain}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}