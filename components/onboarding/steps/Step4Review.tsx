// components/onboarding/steps/Step4Review.tsx

"use client";

import { Building2, Users, CheckCircle, Home, Settings } from "lucide-react";
import { CompanyData, Department, Member } from "../types";
import { useOnboarding } from "@/hooks/useOnboarding";

interface Step4ReviewProps {
  formData: CompanyData;
  departments?: Department[];
  members?: Member[];
  logoPreview: string | null;
  onBack: () => void;
}

export default function Step4Review({ 
  formData, 
  departments = [],
  members = [],
  logoPreview,
  onBack 
}: Step4ReviewProps) {
  // ✅ استفاده از useOnboarding برای دریافت اطلاعات واقعی
  const { companyInfo } = useOnboarding();
  
  // ✅ ترکیب formData و companyInfo (companyInfo اولویت دارد)
  const displayData = {
    name: companyInfo?.name || formData?.companyName || "-",
    phone: companyInfo?.phone || formData?.phone || "-",
    email: companyInfo?.email || formData?.email || "-",
    domain: companyInfo?.domain || formData?.domain || "-",
  };

  const activeDepartments = departments?.filter(d => d.isActive).length || 0;
  const totalMembers = members?.length || 0;
  const managersCount = members?.filter(m => m.role === "manager").length || 0;

  const handleGoToDashboard = () => {
    localStorage.setItem("workspaceCompleted", "true");
    window.location.href = "/dashboard";
  };

  const handleGoToWidgetSettings = () => {
    localStorage.setItem("workspaceCompleted", "true");
    window.location.href = "/dashboard/settings";
  };

  // ✅ دریافت لوگو از companyInfo یا logoPreview
  const displayLogo = companyInfo?.logoUrl || companyInfo?.logoPreview || logoPreview;

  return (
    <div className="space-y-6">
      {/* کارت‌های آماری */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[rgba(89,216,195,0.1)] border border-[rgba(89,216,195,0.2)] flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#59D8C3]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{activeDepartments}</p>
              <p className="text-xs text-gray-500">دپارتمان فعال</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[rgba(89,216,195,0.1)] border border-[rgba(89,216,195,0.2)] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#59D8C3]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalMembers}</p>
              <p className="text-xs text-gray-500">عضو تیم</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[rgba(89,216,195,0.1)] border border-[rgba(89,216,195,0.2)] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#59D8C3]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{managersCount}</p>
              <p className="text-xs text-gray-500">مدیر دپارتمان</p>
            </div>
          </div>
        </div>
      </div>

      {/* اطلاعات شرکت - ✅ با داده‌های صحیح */}
      <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
        <h4 className="text-sm font-semibold text-white mb-4">اطلاعات شرکت</h4>
        <div className="flex items-start gap-4">
          {/* لوگو - ✅ با داده‌های صحیح */}
          <div className="w-16 h-16 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] overflow-hidden flex-shrink-0">
            {displayLogo ? (
              <img src={displayLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gray-500" />
              </div>
            )}
          </div>
          
          {/* اطلاعات - ✅ با داده‌های صحیح */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500 mb-1">نام شرکت</p>
              <p className="text-white font-medium">{displayData.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">شماره پشتیبانی</p>
              <p className="text-white font-medium" dir="ltr">{displayData.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">ایمیل پشتیبانی</p>
              <p className="text-white font-medium" dir="ltr">{displayData.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">دامنه سایت</p>
              <p className="text-white font-medium" dir="ltr">{displayData.domain}</p>
            </div>
          </div>
        </div>
      </div>

      {/* پیام موفقیت */}
      <div className="p-5 rounded-2xl bg-[rgba(91,224,168,0.08)] border border-[rgba(91,224,168,0.2)]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(91,224,168,0.15)] flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-[#5BE0A8]" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white mb-1">Workspace شما آماده است!</h4>
            <p className="text-xs text-gray-400">
              تنظیمات اولیه با موفقیت انجام شد. می‌توانید وارد داشبورد شوید و کار را شروع کنید.
            </p>
          </div>
        </div>
      </div>

      {/* مرحله بعدی */}
      <div className="p-5 rounded-2xl bg-[rgba(89,216,195,0.05)] border border-[rgba(89,216,195,0.15)]">
        <h4 className="text-sm font-semibold text-white mb-2">مرحله بعدی</h4>
        <p className="text-xs text-gray-400 mb-3">
          برای نمایش دکمه چت روی سایت، بعد از ورود به پنل وارد بخش <strong className="text-white">ویجت سایت</strong> شوید و کد نصب را دریافت کنید.
        </p>
        <p className="text-xs text-gray-400">
          در آن بخش می‌توانید رنگ، متن، و فرم ویجت را سفارشی‌سازی کنید.
        </p>
      </div>

      {/* دکمه‌های اقدام */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[rgba(255,255,255,0.1)]">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 bg-[rgba(255,255,255,0.05)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
        >
          بازگشت
        </button>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleGoToWidgetSettings}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.05)] text-white border border-[rgba(255,255,255,0.1)] hover:border-[#59D8C3]/40 transition-all flex items-center justify-center gap-2 order-2 sm:order-1"
          >
            <Settings className="w-4 h-4" />
            رفتن به تنظیمات ویجت سایت
          </button>
          
          <button
            onClick={handleGoToDashboard}
            className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg hover:shadow-[#59D8C3]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
          >
            <Home className="w-4 h-4" />
            ورود به داشبورد
          </button>
        </div>
      </div>
    </div>
  );
}