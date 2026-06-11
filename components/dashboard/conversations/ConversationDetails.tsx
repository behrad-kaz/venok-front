// components/dashboard/conversations/ConversationDetails.tsx
"use client";

import { X, ChevronRight } from "lucide-react";
import { Conversation } from "./types";
import { getStatusBadge } from "./data";
import { UserRole } from "@/stores/useRoleStore";

interface ConversationDetailsProps {
  conversation: Conversation;
  onClose: () => void;
  onChangeStatus: () => void;
  onAssign: () => void;
  onCloseConversation: () => void;
  onBack?: () => void;
  isMobile?: boolean;
  isTablet?: boolean;
  role: UserRole;
}

export default function ConversationDetails({
  conversation,
  onClose,
  onChangeStatus,
  onAssign,
  onCloseConversation,
  onBack,
  isMobile = false,
  isTablet = false,
  role,
}: ConversationDetailsProps) {
  const badge = getStatusBadge(conversation.status);
  
  // نمایش دکمه بازگشت در موبایل و تبلت
  const showBackButton = isMobile || isTablet;
  // در تبلت، عرض کامل و در دسکتاپ عرض ثابت
  const isFullWidth = isMobile || isTablet;

  return (
    <div className={`${isFullWidth ? "h-full w-full" : "w-[320px]"} flex-shrink-0 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-3 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[rgba(255,255,255,0.05)] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.3)] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.5)] animate-fadeInUp`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          <h3 className="text-sm font-bold text-white">جزئیات گفتگو</h3>
        </div>
        {!showBackButton && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">مشتری</label>
          <p className="text-sm text-white">{conversation.customerName}</p>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">شماره همراه</label>
          <p className="text-sm text-white" dir="ltr">{conversation.customerPhone}</p>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">موضوع</label>
          <p className="text-sm text-white">{conversation.subject}</p>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">منبع ورود</label>
          <p className="text-sm text-white">{conversation.source}</p>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">دپارتمان</label>
          <p className="text-sm text-white">{conversation.department}</p>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">مسئول گفتگو</label>
          <p className="text-sm text-white">{conversation.assignee || "تعیین نشده"}</p>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">تاریخ شروع</label>
          <p className="text-sm text-white">{conversation.startDate}</p>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">وضعیت</label>
          <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs ${badge.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${badge.dotColor}`} />
            {badge.text}
          </span>
        </div>

        <div className="pt-4 border-t border-[rgba(255,255,255,0.1)] space-y-2">
          <button
            onClick={onChangeStatus}
            className="w-full px-3 py-2 rounded-xl text-sm font-medium bg-[rgba(89,216,195,0.08)] text-[#59D8C3] border border-[rgba(89,216,195,0.15)] hover:bg-[rgba(89,216,195,0.12)] transition-all"
          >
            تغییر وضعیت
          </button>
          <button
            onClick={onAssign}
            className="w-full px-3 py-2 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
          >
            تخصیص / ارجاع
          </button>
          <button
            onClick={onCloseConversation}
            className="w-full px-3 py-2 rounded-xl text-sm font-medium bg-[rgba(255,107,107,0.08)] text-red-400 border border-[rgba(255,107,107,0.15)] hover:bg-[rgba(255,107,107,0.12)] transition-all"
          >
            بستن گفتگو
          </button>
        </div>
      </div>
    </div>
  );
}