"use client";

import { useRef, useState, useEffect } from "react";
import { Image, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { CompanyInfo } from "./types";

interface WorkspaceCompanyTabProps {
  info: CompanyInfo;
  onInfoChange: (info: CompanyInfo) => void;
}

export default function WorkspaceCompanyTab({ info, onInfoChange }: WorkspaceCompanyTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localLogoPreview, setLocalLogoPreview] = useState<string | null>(null);
  const [hasNewLogo, setHasNewLogo] = useState(false);
  
  // ✅ همیشه false در سرور و کلاینت (تا بعد از Hydration)
  const [isClient, setIsClient] = useState(false);

  // ✅ بعد از Hydration، true میشه
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setUploadStatus('uploading');
    setUploadError(null);

    // ایجاد preview محلی
    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalLogoPreview(reader.result as string);
      setHasNewLogo(true);
      
      onInfoChange({ 
        ...info, 
        logo: reader.result as string,
        logoFile: file
      });
      
      setUploading(false);
      setUploadStatus('success');
      
      setTimeout(() => {
        setUploadStatus('idle');
        setHasNewLogo(false);
        setLocalLogoPreview(null);
      }, 3000);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // تعیین آدرس لوگو برای نمایش
  const getLogoUrl = () => {
    if (hasNewLogo && localLogoPreview) {
      return localLogoPreview;
    }
    if (info.logo) {
      return info.logo;
    }
    return null;
  };

  const logoUrl = getLogoUrl();
  const isUploading = uploadStatus === 'uploading' || uploading;
  const isUploadSuccess = uploadStatus === 'success';
  const isUploadError = uploadStatus === 'error';

  // ✅ مقدار نمایش داده شده برای نام شرکت
  // در سرور و اولین رندر کلاینت: رشته خالی
  // بعد از Hydration: مقدار واقعی از info.name
  const displayName = isClient ? (info.name || "نام شرکت") : "نام شرکت";

  return (
    <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <h3 className="text-base font-bold text-white mb-5">اطلاعات شرکت</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          {/* نام شرکت */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              نام شرکت <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={info.name || ''}
              onChange={(e) => onInfoChange({ ...info, name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
              placeholder="نام شرکت را وارد کنید"
            />
          </div>

          {/* دامنه سایت */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">دامنه سایت شرکت</label>
            <input
              type="text"
              placeholder="https://example.com"
              value={info.domain || ''}
              onChange={(e) => onInfoChange({ ...info, domain: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
              dir="ltr"
            />
          </div>

          {/* توضیحات */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">توضیح کوتاه شرکت</label>
            <textarea
              rows={3}
              value={info.description || ''}
              onChange={(e) => onInfoChange({ ...info, description: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all resize-none"
              placeholder="توضیحات شرکت را وارد کنید"
            />
          </div>

          {/* لوگوی شرکت */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">لوگوی شرکت</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden relative">
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="w-6 h-6 text-[#59D8C3] animate-spin" />
                    <span className="text-[10px] text-gray-500 mt-1">در حال آپلود...</span>
                  </div>
                ) : (
                  // ✅ فقط در کلاینت لوگو رو نمایش بده (بعد از Hydration)
                  isClient && logoUrl ? (
                    <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                  ) : (
                    <Image className="w-8 h-8 text-gray-500" />
                  )
                )}
                
                {isUploadSuccess && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                )}
                
                {isUploadError && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
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
                  disabled={isUploading}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    isUploading
                      ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                      : 'bg-[rgba(255,255,255,0.05)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)]'
                  }`}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{isUploading ? 'در حال آپلود...' : 'آپلود لوگو'}</span>
                </button>
                {uploadError && (
                  <p className="text-xs text-red-400 mt-2">{uploadError}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">فرمت PNG یا JPG، حداکثر ۲ مگابایت</p>
              </div>
            </div>
          </div>
        </div>

        {/* پیش‌نمایش */}
        <div className="p-5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] h-fit">
          <p className="text-xs text-gray-500 mb-4">پیش‌نمایش ظاهر در سیستم:</p>
          <div className="p-4 rounded-xl bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden">
                {/* ✅ فقط در کلاینت لوگو رو نمایش بده (بعد از Hydration) */}
                {isClient && logoUrl ? (
                  <img src={logoUrl} alt="logo" className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <Image className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div>
                {/* ✅ نمایش نام شرکت با مقدار ثابت در سرور و مقدار واقعی در کلاینت */}
                <p className="text-sm font-bold text-white">{displayName}</p>
                <p className="text-xs text-gray-500">{info.description || "توضیحات شرکت"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}