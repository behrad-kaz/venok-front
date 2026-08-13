// components/dashboard/admin/AttentionNeeded.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/hooks/useNotifications";
import { memo, useMemo } from "react";

function AttentionNeededComponent() {
  const { notifications, isLoading } = useNotifications();

  // ✅ استفاده از useMemo برای جلوگیری از محاسبات مجدد در هر رندر
  const attentionItems = useMemo(() => {
    return notifications
      .filter(n => n.type === 'warning' || n.type === 'danger')
      .slice(0, 4)
      .map(n => ({
        id: n.id,
        title: n.title,
        description: n.description,
        buttonText: n.buttonText,
        buttonLink: n.buttonLink,
        type: n.type as "warning" | "info" | "danger",
      }));
  }, [notifications]);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-[#F2B84B]" />
          <h3 className="text-sm font-bold text-white">نیازمند توجه</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.05)]" />
              <div className="flex-1">
                <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[rgba(255,255,255,0.05)] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (attentionItems.length === 0) {
    return (
      <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-[#F2B84B]" />
          <h3 className="text-sm font-bold text-white">نیازمند توجه</h3>
        </div>
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-[rgba(91,224,168,0.1)] flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-[#5BE0A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-400">همه چیز خوب است!</p>
          <p className="text-xs text-gray-500 mt-1">هیچ مورد نیازمند توجهی وجود ندارد</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-[#F2B84B]" />
        <h3 className="text-sm font-bold text-white">نیازمند توجه</h3>
        {attentionItems.length > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F2B84B] text-[#1c1302]">
            {attentionItems.length}
          </span>
        )}
      </div>

      {/* ✅ استفاده از AnimatePresence با کلید unique برای مدیریت انیمیشن */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {attentionItems.map((item, index) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  item.type === "danger"
                    ? "bg-[rgba(255,107,107,0.1)] text-red-400"
                    : item.type === "warning"
                    ? "bg-[rgba(242,184,75,0.1)] text-[#F2B84B]"
                    : "bg-[rgba(89,216,195,0.1)] text-[#59D8C3]"
                }`}
              >
                {item.type === "danger" ? (
                  <AlertCircle className="w-4 h-4" />
                ) : item.type === "warning" ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white mb-0.5">{item.title}</p>
                <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                <Link
                  href={item.buttonLink}
                  className="text-xs text-[#59D8C3] hover:text-[#6ef3dc] font-medium transition-colors inline-flex items-center gap-1"
                >
                  {item.buttonText} ←
                </Link>
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ✅ استفاده از memo برای جلوگیری از رندر مجدد
export default memo(AttentionNeededComponent);