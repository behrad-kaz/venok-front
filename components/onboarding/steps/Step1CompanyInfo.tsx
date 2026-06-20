// components/onboarding/steps/Step1CompanyInfo.tsx
'use client';

import { useRef, forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { MessageCircle, Image, Phone, Mail, Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

export interface Step1CompanyInfoRef {
  handleSaveAll: () => Promise<void>;
}

// استفاده از object به جای interface خالی
type Step1CompanyInfoProps = object;

const Step1CompanyInfo = forwardRef<Step1CompanyInfoRef, Step1CompanyInfoProps>((_, ref) => {
  const {
    companyInfo,
    uploadStatus,
    uploadError,
    isSaving,
    setCompanyInfo,
    handleSaveAll,
  } = useOnboarding();

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ✅ state محلی برای tracking لوگو (برای جلوگیری از lost در re-render)
  const [localLogo, setLocalLogo] = useState<File | null>(null);
  const [localLogoPreview, setLocalLogoPreview] = useState<string | null>(null);
  
  // ✅ state برای تشخیص اینکه کاربر لوگوی جدید انتخاب کرده
  const [hasNewLogo, setHasNewLogo] = useState(false);

  // ✅ وقتی لوگو از سرور آپلود شد، state جدید رو reset کن
  useEffect(() => {
    if (uploadStatus === 'success' && companyInfo.logoUrl) {
      setHasNewLogo(false);
      setLocalLogo(null);
      setLocalLogoPreview(null);
    }
  }, [uploadStatus, companyInfo.logoUrl]);

  // expose handleSaveAll به parent
  useImperativeHandle(ref, () => ({
    handleSaveAll: async () => {
      // ✅ قبل از ذخیره، اطمینان از وجود لوگو در store
      if (localLogo) {
        console.log('📤 انتقال لوگو از state محلی به store:', localLogo.name);
        setCompanyInfo({
          logo: localLogo,
          logoPreview: localLogoPreview,
        });
      }
      await handleSaveAll();
    },
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyInfo({ [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('حجم فایل باید کمتر از ۲ مگابایت باشد');
      return;
    }

    if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
      alert('فرمت فایل باید PNG یا JPG باشد');
      return;
    }

    // ایجاد preview
    const reader = new FileReader();
    reader.onloadend = () => {
      // ✅ ذخیره در state محلی
      setLocalLogo(file);
      setLocalLogoPreview(reader.result as string);
      setHasNewLogo(true); // ✅ علامت‌گذاری که لوگوی جدید انتخاب شده
      
      // ✅ همچنین در store ذخیره کن برای نمایش (اما logoUrl اولویت نداره)
      setCompanyInfo({
        logo: file,
        logoPreview: reader.result as string,
      });
      
      console.log('✅ لوگو انتخاب شد:', file.name, 'حجم:', file.size);
    };
    reader.readAsDataURL(file);
  };

  const isUploading = uploadStatus === 'uploading';
  const isUploadSuccess = uploadStatus === 'success';
  const isUploadError = uploadStatus === 'error';
  
  const getLogoUrl = () => {
    if (hasNewLogo && localLogoPreview) {
      return localLogoPreview;
    }
    if (companyInfo.logoUrl) {
      return companyInfo.logoUrl;
    }
    if (companyInfo.logoPreview) {
      return companyInfo.logoPreview;
    }
    if (localLogoPreview) {
      return localLogoPreview;
    }
    return null;
  };

  const logoUrl = getLogoUrl();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        {/* نام شرکت */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            نام شرکت (اختیاری)
          </label>
          <input
            type="text"
            name="name"
            value={companyInfo.name}
            onChange={handleInputChange}
            className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
            placeholder="مثال: آژانس سفر نمونه"
            disabled={isSaving}
          />
        </div>

        {/* لوگوی شرکت */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">لوگوی شرکت</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden relative">
              {isUploading ? (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 text-[#59D8C3] animate-spin" />
                  <span className="text-[10px] text-gray-500 mt-1">در حال آپلود...</span>
                </div>
              ) : logoUrl ? (
                <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <Image className="w-6 h-6 text-gray-500" />
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
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading || isSaving}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isSaving}
                className={`px-4 py-2 rounded-xl text-sm transition-all cursor-pointer inline-flex items-center gap-2 ${
                  isUploading || isSaving
                    ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                    : 'bg-[rgba(255,255,255,0.05)] text-white border border-[rgba(255,255,255,0.1)] hover:border-[#59D8C3]'
                }`}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>{isUploading ? 'در حال آپلود...' : 'انتخاب لوگو'}</span>
              </button>
              
              {uploadError && (
                <p className="text-xs text-red-400 mt-2">{uploadError}</p>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                فرمت PNG یا JPG با حداکثر حجم ۲ مگابایت
              </p>
            </div>
          </div>
        </div>

        {/* شماره تماس و ایمیل */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              شماره تماس پشتیبانی (اختیاری)
            </label>
            <input
              type="tel"
              name="phone"
              value={companyInfo.phone}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
              placeholder="۰۲۱۱۲۳۴۵۶۷۸"
              dir="ltr"
              disabled={isSaving}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              ایمیل پشتیبانی (اختیاری)
            </label>
            <input
              type="email"
              name="email"
              value={companyInfo.email}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
              placeholder="support@example.com"
              dir="ltr"
              disabled={isSaving}
            />
          </div>
        </div>
      </div>

      {/* پیش‌نمایش */}
      <div className="lg:col-span-1">
        <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] sticky top-6">
          <h4 className="text-sm font-semibold text-white mb-3">پیش‌نمایش</h4>
          <p className="text-xs text-gray-500 mb-4">
            این اطلاعات در ویجت سایت و صفحه ورود مشتریان نمایش داده می‌شود.
          </p>
          <div className="p-4 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(89,216,195,0.1)] border border-[#59D8C3] flex items-center justify-center overflow-hidden flex-shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                ) : (
                  <MessageCircle className="w-5 h-5 text-[#59D8C3]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {companyInfo.name || 'نام شرکت'}
                </p>
                <p className="text-[10px] text-gray-500">همیشه در دسترس شما هستیم</p>
              </div>
            </div>
            <div className="space-y-2 text-[10px] text-gray-500">
              {companyInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-[#59D8C3]" />
                  <span>{companyInfo.phone}</span>
                </div>
              )}
              {companyInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-[#59D8C3]" />
                  <span>{companyInfo.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Step1CompanyInfo.displayName = 'Step1CompanyInfo';

export default Step1CompanyInfo;