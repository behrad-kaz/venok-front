// components/dashboard/widget/WidgetStatusTab.tsx

"use client";

import { useState, useEffect } from "react";
import { Copy, Send, HelpCircle, Power, RefreshCw } from "lucide-react";
import { WidgetStatus } from "./types";

interface WidgetStatusTabProps {
  status: WidgetStatus;
  onToggleStatus: () => void;
  onCheckConnection: () => void;
}

const widgetCode = `<script src="https://chat.example.com/widget.js" data-workspace="agency-demo"></script>`;

export default function WidgetStatusTab({ status, onToggleStatus, onCheckConnection }: WidgetStatusTabProps) {
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // تشخیص سایز صفحه
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* وضعیت ویجت */}
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">وضعیت ویجت</h3>
          <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs ${
            status.isActive
              ? "bg-[rgba(91,224,168,0.12)] text-[#5be0a8] border-[rgba(91,224,168,0.28)]"
              : "bg-[rgba(111,136,128,0.12)] text-gray-400 border-[rgba(111,136,128,0.22)]"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.isActive ? "bg-[#5be0a8]" : "bg-gray-500"}`} />
            {status.isActive ? "فعال" : "غیرفعال"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
            <p className="text-xs text-gray-500 mb-1">دامنه سایت</p>
            <p className="text-sm font-medium text-white truncate" dir="ltr">{status.domain}</p>
          </div>
          <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
            <p className="text-xs text-gray-500 mb-1">آخرین درخواست</p>
            <p className="text-sm font-medium text-white">{status.lastRequest}</p>
          </div>
          <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
            <p className="text-xs text-gray-500 mb-1">درخواست‌های امروز</p>
            <p className="text-sm font-medium text-white">{status.todayRequests}</p>
          </div>
          <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
            <p className="text-xs text-gray-500 mb-1">گفتگوهای ساخته‌شده از ویجت</p>
            <p className="text-sm font-medium text-white">{status.totalConversations}</p>
          </div>
          <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
            <p className="text-xs text-gray-500 mb-1">آخرین بررسی اتصال</p>
            <p className="text-sm font-medium text-white">{status.lastCheck}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onToggleStatus}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              status.isActive
                ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                : "bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg"
            }`}
          >
            <Power className="w-4 h-4" />
            {status.isActive ? "غیرفعال‌سازی ویجت" : "فعال‌سازی ویجت"}
          </button>
          <button
            onClick={onCheckConnection}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            بررسی اتصال
          </button>
        </div>
      </div>

      {/* کد نصب روی سایت */}
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
        <h3 className="text-base font-bold text-white mb-2">کد نصب روی سایت</h3>
        <p className="text-sm text-gray-500 mb-5">این کد باید قبل از بسته شدن تگ body در سایت شرکت قرار بگیرد.</p>
        
        <div className="relative mb-5">
          <pre className="p-4 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] text-sm text-[#5BE0A8] font-mono overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-[rgba(255,255,255,0.05)] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.3)] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.5)]" dir="ltr">
            {widgetCode}
          </pre>
          
          {/* دکمه کپی - در دسکتاپ بالا چپ، در موبایل پایین چپ */}
          <button
            onClick={handleCopyCode}
            className={`${
              isMobile 
                ? "absolute bottom-3 left-3" 
                : "absolute top-3 left-3"
            } px-3 py-1.5 rounded-lg text-xs font-medium bg-[rgba(255,255,255,0.08)] text-white border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.12)] transition-all flex items-center gap-2`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? "کپی شد!" : "کپی کد"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button className="px-4 py-2 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all flex items-center gap-2">
            <Send className="w-4 h-4" />
            ارسال برای برنامه‌نویس
          </button>
          <button className="px-4 py-2 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            مشاهده راهنمای نصب
          </button>
        </div>
      </div>
    </div>
  );
}