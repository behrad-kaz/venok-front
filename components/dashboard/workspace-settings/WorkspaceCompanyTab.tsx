"use client";

import { useRef, useState, useEffect } from "react";
import { Image, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { CompanyInfo } from "./types";
import { api } from "@/services/api-client";

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
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  // ✅ استفاده از useState با lazy initialization برای تشخیص کلاینت
  const [isClient, setIsClient] = useState(false);

  // ✅ فقط یک بار در useEffect، بدون setState مستقیم در بدنه
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      setIsClient(true);
    });
    
    return () => cancelAnimationFrame(rafId);
  }, []);

  // ✅ بارگذاری اطلاعات از Organization API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // 1. دریافت اطلاعات workspace (برای name, phone, email)
        const workspaceId = localStorage.getItem("currentWorkspaceId");
        let workspaceData = null;
        
        if (workspaceId) {
          console.log('🔄 دریافت اطلاعات workspace از API...');
          workspaceData = await api.get<{ 
            id: number; 
            name: string; 
            phone: string | null; 
            email: string | null;
          }>(`/workspace/${workspaceId}`);
          console.log('📡 اطلاعات workspace دریافت شد:', workspaceData);
        }
        
        // 2. دریافت اطلاعات organization (برای logo, description, website)
        console.log('🔄 دریافت اطلاعات organization از API...');
        const orgData = await api.get<{ 
          logo: string | null;
          description: string | null;
          website: string | null;
          name?: string;
          legalName?: string;
        }>('/organization/current');
        console.log('📡 organization دریافت شد:', orgData);
        
        // 3. به‌روزرسانی info با مقادیر
        const updatedInfo: CompanyInfo = {
          ...info,
          name: workspaceData?.name || orgData?.name || '',
          phone: workspaceData?.phone || '',
          email: workspaceData?.email || '',
          description: orgData?.description || '',
          domain: orgData?.website || '',
          logo: orgData?.logo || null,
        };
        
        onInfoChange(updatedInfo);
        
        // 4. تنظیم logoUrl برای نمایش
        if (orgData?.logo) {
          setLogoUrl(orgData.logo);
          localStorage.setItem("companyLogo", orgData.logo);
        }
        
      } catch (error) {
        console.error('❌ خطا در دریافت اطلاعات:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("حجم فایل باید کمتر از ۲ مگابایت باشد");
      return;
    }

    if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
      alert("فرمت فایل باید PNG یا JPG باشد");
      return;
    }

    setUploading(true);
    setUploadStatus('uploading');
    setUploadError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalLogoPreview(reader.result as string);
      setHasNewLogo(true);
      setLogoUrl(reader.result as string);
      
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
    if (logoUrl) {
      return logoUrl;
    }
    if (info.logo) {
      return info.logo;
    }
    return null;
  };

  const displayLogoUrl = getLogoUrl();
  const isUploading = uploadStatus === 'uploading' || uploading;
  const isUploadSuccess = uploadStatus === 'success';
  const isUploadError = uploadStatus === 'error';

  const displayName = isClient ? (info.name || "نام شرکت") : "نام شرکت";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#59D8C3] animate-spin" />
        <span className="mr-3 text-gray-400">در حال بارگذاری اطلاعات...</span>
      </div>
    );
  }

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

          {/* دامنه سایت - دریافت از organization.website */}
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

          {/* توضیحات - دریافت از organization.description */}
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
                  isClient && displayLogoUrl ? (
                    <img 
                      src={displayLogoUrl} 
                      alt="logo" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.warn('⚠️ خطا در نمایش لوگو');
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
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
                {isClient && displayLogoUrl ? (
                  <img 
                    src={displayLogoUrl} 
                    alt="logo" 
                    className="w-8 h-8 rounded-lg object-cover"
                    onError={(e) => {
                      console.warn('⚠️ خطا در نمایش لوگو (پیش‌نمایش)');
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Image className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div>
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