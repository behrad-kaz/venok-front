"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { SupportInfo } from "./types";
import { api } from "@/services/api-client";

interface WorkspaceSupportTabProps {
  info: SupportInfo;
  onInfoChange: (info: SupportInfo) => void;
}

export default function WorkspaceSupportTab({ info, onInfoChange }: WorkspaceSupportTabProps) {
  const [isLoading, setIsLoading] = useState(false);

  // ✅ بارگذاری اطلاعات workspace از API
  useEffect(() => {
    const loadWorkspaceData = async () => {
      try {
        setIsLoading(true);
        const workspaceId = localStorage.getItem("currentWorkspaceId");
        
        if (!workspaceId) {
          console.warn('⚠️ workspaceId یافت نشد');
          return;
        }

        console.log('🔄 دریافت اطلاعات workspace از API برای SupportTab...');
        const data = await api.get<{ 
          id: number; 
          phone: string | null; 
          email: string | null;
        }>(`/workspace/${workspaceId}`);
        
        console.log('📡 اطلاعات workspace دریافت شد:', data);
        
        if (data) {
          // ✅ به‌روزرسانی supportInfo با مقادیر workspace
          onInfoChange({
            ...info,
            phone: data.phone || '',
            email: data.email || '',
          });
        }
      } catch (error) {
        console.error('❌ خطا در دریافت اطلاعات workspace:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspaceData();
  }, []);

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
      <h3 className="text-base font-bold text-white mb-2">اطلاعات پشتیبانی</h3>
      <p className="text-sm text-gray-500 mb-5">این اطلاعات در بخش‌های عمومی و ارتباطات پشتیبانی استفاده می‌شود.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-white mb-2">شماره تماس پشتیبانی</label>
          <input
            type="text"
            placeholder="۰۲۱-۱۲۳۴۵۶۷۸"
            value={info.phone}
            onChange={(e) => onInfoChange({ ...info, phone: e.target.value })}
            className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">ایمیل پشتیبانی</label>
          <input
            type="email"
            placeholder="support@example.com"
            value={info.email}
            onChange={(e) => onInfoChange({ ...info, email: e.target.value })}
            className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">شماره همراه اصلی برای هشدارهای مدیریتی</label>
          <input
            type="text"
            placeholder="۰۹۱۲-۱۲۳-۴۵۶۷"
            value={info.alertPhone}
            onChange={(e) => onInfoChange({ ...info, alertPhone: e.target.value })}
            className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            dir="ltr"
          />
        </div>
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-white mb-2">متن کوتاه معرفی پشتیبانی</label>
          <textarea
            rows={3}
            value={info.introText}
            onChange={(e) => onInfoChange({ ...info, introText: e.target.value })}
            className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
}