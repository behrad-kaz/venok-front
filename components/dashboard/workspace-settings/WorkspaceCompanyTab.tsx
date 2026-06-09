// components/dashboard/workspace-settings/WorkspaceCompanyTab.tsx

"use client";

import { useRef, useState } from "react";
import { Image, Upload } from "lucide-react";
import { CompanyInfo } from "./types";

interface WorkspaceCompanyTabProps {
  info: CompanyInfo;
  onInfoChange: (info: CompanyInfo) => void;
}

export default function WorkspaceCompanyTab({ info, onInfoChange }: WorkspaceCompanyTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // بررسی حجم فایل (حداکثر 2 مگابایت)
    if (file.size > 2 * 1024 * 1024) {
      alert("حجم فایل باید کمتر از ۲ مگابایت باشد");
      return;
    }

    // بررسی نوع فایل
    if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
      alert("فرمت فایل باید PNG یا JPG باشد");
      return;
    }

    setUploading(true);

    // شبیه‌سازی آپلود (در حالت واقعی، اینجا درخواست API زده می‌شود)
    const reader = new FileReader();
    reader.onloadend = () => {
      onInfoChange({ ...info, logo: reader.result as string });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <h3 className="text-base font-bold text-white mb-5">اطلاعات شرکت</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              نام شرکت <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={info.name}
              onChange={(e) => onInfoChange({ ...info, name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">دامنه سایت شرکت</label>
            <input
              type="text"
              placeholder="https://example.com"
              value={info.domain}
              onChange={(e) => onInfoChange({ ...info, domain: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">توضیح کوتاه شرکت</label>
            <textarea
              rows={3}
              value={info.description}
              onChange={(e) => onInfoChange({ ...info, description: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">لوگوی شرکت</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden">
                {info.logo ? (
                  <img src={info.logo} alt="logo" className="w-full h-full object-cover" />
                ) : (
                  <Image className="w-8 h-8 text-gray-500" />
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  onClick={triggerFileInput}
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.05)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? "در حال آپلود..." : "آپلود لوگو"}
                </button>
                <p className="text-xs text-gray-500 mt-2">فرمت PNG یا JPG، حداکثر ۲ مگابایت</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] h-fit">
          <p className="text-xs text-gray-500 mb-4">پیش‌نمایش ظاهر در سیستم:</p>
          <div className="p-4 rounded-xl bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden">
                {info.logo ? (
                  <img src={info.logo} alt="logo" className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <Image className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{info.name || "نام شرکت"}</p>
                <p className="text-xs text-gray-500">{info.description || "توضیحات شرکت"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}