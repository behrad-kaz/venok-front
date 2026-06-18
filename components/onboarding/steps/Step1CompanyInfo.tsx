"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Image, Phone, Mail, Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { CompanyData } from "../types";

// تعریف تایپ برای workspace data
interface WorkspaceData {
  id: number;
  name: string;
  slug: string;
  code: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  postalCode?: string;
  locale?: string;
}

interface Step1CompanyInfoProps {
  formData: CompanyData;
  logoPreview: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoUploaded?: (logoUrl: string, logoId: string) => void;
  onWorkspaceCreated?: (workspaceData: WorkspaceData) => void;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";
type WorkspaceStatus = "idle" | "creating" | "success" | "error";

export default function Step1CompanyInfo({
  formData,
  logoPreview,
  onInputChange,
  onLogoChange,
  onLogoUploaded,
  onWorkspaceCreated,
}: Step1CompanyInfoProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedLogoId, setUploadedLogoId] = useState<string | null>(null);
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
  const [workspaceStatus, setWorkspaceStatus] = useState<WorkspaceStatus>("idle");
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<number | null>(null);
  const isMounted = useRef(true);

  // بررسی workspace موجود در localStorage - با استفاده از useRef برای جلوگیری از setState در اثر
  useEffect(() => {
    const existingWorkspaceId = localStorage.getItem("currentWorkspaceId");
    if (existingWorkspaceId) {
      // استفاده از setTimeout برای جلوگیری از setState مستقیم در اثر
      setTimeout(() => {
        if (isMounted.current) {
          setCurrentWorkspaceId(parseInt(existingWorkspaceId));
          setWorkspaceStatus("success");
        }
      }, 0);
    }
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // تابع کمکی برای تنظیم کوکی
  const setCookie = (name: string, value: string, days: number) => {
    if (typeof document !== 'undefined') {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
    }
  };

  // تبدیل نام فارسی به slug انگلیسی
  const generateSlug = (name: string): string => {
    let slug = name.trim().toLowerCase();
    
    const persianMap: { [key: string]: string } = {
      'آ': 'a', 'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's',
      'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z',
      'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's',
      'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f',
      'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n',
      'و': 'v', 'ه': 'h', 'ی': 'y', ' ':'-', '_': '-'
    };
    
    slug = slug.split('').map(char => persianMap[char] || char).join('');
    slug = slug.replace(/[^a-z0-9-]/g, '');
    slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    if (!slug) slug = "workspace";
    
    // فقط برای workspace جدید timestamp اضافه کن
    if (!currentWorkspaceId) {
      slug = `${slug}-${Date.now()}`;
    }
    
    return slug;
  };

  // به روزرسانی workspace موجود (به جای ساخت جدید)
  const updateWorkspace = async (name: string, phone: string, email: string) => {
    if (!currentWorkspaceId) {
      return createWorkspace(name, phone, email);
    }

    setWorkspaceStatus("creating");
    setWorkspaceError(null);

    try {
      const accessToken = localStorage.getItem("accessToken");
      const contextToken = localStorage.getItem("contextToken");
      
      if (!accessToken) {
        throw new Error("توکن معتبر یافت نشد");
      }
      
      const slug = generateSlug(name);
      
      console.log("🚀 در حال به روزرسانی workspace...", { name, phone, email, slug });
      
      const response = await fetch(`http://localhost:3001/workspace/${currentWorkspaceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "x-context-token": contextToken || "",
        },
        body: JSON.stringify({
          name: name,
          slug: slug,
          phone: phone,
          email: email,
        }),
      });

      console.log("📡 وضعیت به روزرسانی workspace:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ خطای سرور:", errorText);
        throw new Error(`خطا در به روزرسانی workspace: ${response.status} - ${errorText}`);
      }

      const workspaceData: WorkspaceData = await response.json();
      console.log("✅ به روزرسانی workspace موفق:", workspaceData);
      
      localStorage.setItem("currentWorkspace", JSON.stringify(workspaceData));
      localStorage.setItem("workspaceSlug", workspaceData.slug);
      
      setCookie("workspaceSlug", workspaceData.slug, 7);
      
      setWorkspaceStatus("success");
      
      if (onWorkspaceCreated) {
        onWorkspaceCreated(workspaceData);
      }
      
      setTimeout(() => {
        if (isMounted.current) {
          setWorkspaceStatus("idle");
        }
      }, 3000);
      
      return workspaceData;
      
    } catch (error) {
      console.error("❌ خطا در به روزرسانی workspace:", error);
      if (isMounted.current) {
        setWorkspaceError(error instanceof Error ? error.message : "خطا در به روزرسانی workspace");
        setWorkspaceStatus("error");
      }
      
      setTimeout(() => {
        if (isMounted.current) {
          setWorkspaceStatus("idle");
          setWorkspaceError(null);
        }
      }, 3000);
      
      throw error;
    }
  };

  // ساخت workspace جدید
  const createWorkspace = async (name: string, phone: string, email: string) => {
    setWorkspaceStatus("creating");
    setWorkspaceError(null);

    try {
      const accessToken = localStorage.getItem("accessToken");
      const contextToken = localStorage.getItem("contextToken");
      
      if (!accessToken) {
        throw new Error("توکن معتبر یافت نشد");
      }
      
      const slug = generateSlug(name);
      const code = slug;
      
      console.log("🚀 در حال ساخت workspace...", { name, phone, email, slug, code });
      
      const response = await fetch("http://localhost:3001/workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "x-context-token": contextToken || "",
        },
        body: JSON.stringify({
          name: name,
          code: code,
          slug: slug,
          phone: phone,
          email: email,
          address: "",
          city: "",
          postalCode: "",
          locale: "fa-IR",
        }),
      });

      console.log("📡 وضعیت ساخت workspace:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ خطای سرور:", errorText);
        
        if (response.status === 403) {
          if (isMounted.current) {
            setWorkspaceError("شما دسترسی ساخت workspace را ندارید. لطفاً با پشتیبانی تماس بگیرید.");
          }
        } else {
          throw new Error(`خطا در ساخت workspace: ${response.status} - ${errorText}`);
        }
        return;
      }

      const workspaceData: WorkspaceData = await response.json();
      console.log("✅ ساخت workspace موفق:", workspaceData);
      
      localStorage.setItem("currentWorkspace", JSON.stringify(workspaceData));
      localStorage.setItem("currentWorkspaceId", String(workspaceData.id));
      localStorage.setItem("workspaceSlug", workspaceData.slug);
      
      setCookie("workspaceId", String(workspaceData.id), 7);
      setCookie("workspaceSlug", workspaceData.slug, 7);
      
      if (isMounted.current) {
        setCurrentWorkspaceId(workspaceData.id);
        setWorkspaceStatus("success");
      }
      
      if (onWorkspaceCreated) {
        onWorkspaceCreated(workspaceData);
      }
      
      setTimeout(() => {
        if (isMounted.current) {
          setWorkspaceStatus("idle");
        }
      }, 3000);
      
      return workspaceData;
      
    } catch (error) {
      console.error("❌ خطا در ساخت workspace:", error);
      if (isMounted.current) {
        setWorkspaceError(error instanceof Error ? error.message : "خطا در ساخت workspace");
        setWorkspaceStatus("error");
      }
      
      setTimeout(() => {
        if (isMounted.current) {
          setWorkspaceStatus("idle");
          setWorkspaceError(null);
        }
      }, 3000);
      
      throw error;
    }
  };

  // آپلود لوگو
  const handleLogoUpload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("حجم فایل باید کمتر از ۲ مگابایت باشد");
      setUploadStatus("error");
      return;
    }

    if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
      setUploadError("فرمت فایل باید PNG یا JPG باشد");
      setUploadStatus("error");
      return;
    }

    setUploadStatus("uploading");
    setUploadError(null);

    try {
      const accessToken = localStorage.getItem("accessToken");
      const contextToken = localStorage.getItem("contextToken");
      
      if (!accessToken) {
        throw new Error("توکن معتبر یافت نشد");
      }

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("policy", "ORGANIZATION_LOGO");
      formDataUpload.append("visibility", "PUBLIC");
      formDataUpload.append("resourceType", "ORGANIZATION");
      formDataUpload.append("resourceId", "1");
      formDataUpload.append("isPrimary", "true");
      formDataUpload.append("sortOrder", "0");

      console.log("🚀 در حال ارسال درخواست آپلود...");
      
      const uploadResponse = await fetch("http://localhost:3001/uploads", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "x-context-token": contextToken || "",
        },
        body: formDataUpload,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`خطا در آپلود: ${uploadResponse.status} - ${errorText}`);
      }

      const uploadData = await uploadResponse.json();
      const logoId = uploadData.id;
      setUploadedLogoId(logoId);
      
      const fileResponse = await fetch(`http://localhost:3001/uploads/${logoId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "x-context-token": contextToken || "",
        },
      });

      if (!fileResponse.ok) {
        throw new Error(`خطا در دریافت URL: ${fileResponse.status}`);
      }

      const fileData = await fileResponse.json();
      const logoUrl = fileData.url;
      setUploadedLogoUrl(logoUrl);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const fakeEvent = {
          target: { files: [file] }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onLogoChange(fakeEvent);
      };
      reader.readAsDataURL(file);
      
      setUploadStatus("success");
      
      if (onLogoUploaded) {
        onLogoUploaded(logoUrl, logoId);
      }
      
      setTimeout(() => {
        if (isMounted.current) {
          setUploadStatus("idle");
        }
      }, 3000);
      
    } catch (error) {
      console.error("❌ خطا در آپلود لوگو:", error);
      setUploadError(error instanceof Error ? error.message : "خطا در آپلود لوگو");
      setUploadStatus("error");
      
      setTimeout(() => {
        if (isMounted.current) {
          setUploadStatus("idle");
          setUploadError(null);
        }
      }, 3000);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleLogoUpload(file);
    }
  };

  // هندلر تغییر ورودی‌ها
  const handleInputChangeWithWorkspace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    const fakeEvent = {
      target: { name, value }
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(fakeEvent);
    
    const newCompanyName = name === "companyName" ? value : formData.companyName;
    const newPhone = name === "phone" ? value : formData.phone;
    const newEmail = name === "email" ? value : formData.email;
    
    if (newCompanyName && newPhone && newEmail && workspaceStatus === "idle") {
      setTimeout(async () => {
        try {
          if (currentWorkspaceId) {
            await updateWorkspace(newCompanyName, newPhone, newEmail);
          } else {
            await createWorkspace(newCompanyName, newPhone, newEmail);
          }
        } catch (error) {
          console.error("خطا در ساخت/به روزرسانی workspace:", error);
        }
      }, 1000);
    }
  };

  const isUploading = uploadStatus === "uploading";
  const isUploadSuccess = uploadStatus === "success";
  const isUploadError = uploadStatus === "error";
  const isCreatingWorkspace = workspaceStatus === "creating";
  const isWorkspaceSuccess = workspaceStatus === "success";
  const isWorkspaceError = workspaceStatus === "error";

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
            onChange={handleInputChangeWithWorkspace}
            className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
            placeholder="مثال: آژانس سفر نمونه"
          />
          {isCreatingWorkspace && (
            <p className="text-xs text-[#59D8C3] mt-1 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              در حال ذخیره اطلاعات...
            </p>
          )}
          {isWorkspaceSuccess && (
            <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              اطلاعات با موفقیت ذخیره شد
            </p>
          )}
          {isWorkspaceError && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {workspaceError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">لوگوی شرکت</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden relative">
              {isUploading ? (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 text-[#59D8C3] animate-spin" />
                  <span className="text-[10px] text-gray-500 mt-1">در حال آپلود...</span>
                </div>
              ) : logoPreview || uploadedLogoUrl ? (
                <img src={logoPreview || uploadedLogoUrl || ""} alt="logo" className="w-full h-full object-cover" />
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
              <label className={`px-4 py-2 rounded-xl text-sm transition-all cursor-pointer inline-flex items-center gap-2 ${
                isUploading
                  ? "bg-gray-500/50 text-gray-400 cursor-not-allowed"
                  : "bg-[rgba(255,255,255,0.05)] text-white border border-[rgba(255,255,255,0.1)] hover:border-[#59D8C3]"
              }`}>
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>{isUploading ? "در حال آپلود..." : "انتخاب و آپلود لوگو"}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  disabled={isUploading}
                  className="hidden" 
                />
              </label>
              
              {uploadError && (
                <p className="text-xs text-red-400 mt-2">{uploadError}</p>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                فرمت PNG یا JPG با حداکثر حجم ۲ مگابایت
              </p>
            </div>
          </div>
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
              onChange={handleInputChangeWithWorkspace}
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
              onChange={handleInputChangeWithWorkspace}
              className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
              placeholder="support@example.com"
              dir="ltr"
            />
          </div>
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
                {logoPreview || uploadedLogoUrl ? (
                  <img src={logoPreview || uploadedLogoUrl || ""} alt="logo" className="w-full h-full object-cover" />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}