// components/dashboard/employee/EmployeeDetailsSidebar.tsx

"use client";

import { X, UserPlus, Flag, CheckCircle } from "lucide-react";
import { Conversation } from "./types";
import { statusConfig } from "./data";

interface EmployeeDetailsSidebarProps {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmployeeDetailsSidebar({ conversation, isOpen, onClose }: EmployeeDetailsSidebarProps) {
  if (!isOpen) return null;

  const status = statusConfig[conversation.status];

  return (
    <div className="h-full rounded-2xl min-w-[20%] bg-[rgba(9,22,18,0.98)] border-l border-[rgba(255,255,255,0.1)] overflow-y-auto shadow-2xl">
      <div className="p-4 border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between">
        <h3 className="text-base font-bold text-white">جزئیات گفتگو</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center justify-center"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      
      <div className="p-4 space-y-6">
        {/* اطلاعات مشتری */}
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-3">اطلاعات مشتری</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center flex-shrink-0">
                <span className="text-base font-bold text-white">{conversation.customerInitial}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">{conversation.customerName}</p>
                <p className="text-xs text-gray-500" dir="ltr">{conversation.customerPhone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* جزئیات گفتگو */}
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-3">جزئیات گفتگو</h4>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-gray-500 mb-1">وضعیت</p>
              <span className={`text-xs font-medium px-2 py-1 rounded ${status.color}`}>
                {status.label}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 mb-1">موضوع</p>
              <p className="text-sm text-white">{conversation.subject}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 mb-1">دپارتمان</p>
              <p className="text-sm text-white">{conversation.department}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 mb-1">منبع</p>
              <p className="text-sm text-white">{conversation.source}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 mb-1">تاریخ ایجاد</p>
              <p className="text-sm text-white">{conversation.startDate}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 mb-1">آخرین فعالیت</p>
              <p className="text-sm text-white">{conversation.lastActivity}</p>
            </div>
          </div>
        </div>

        {/* عملیات */}
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-3">عملیات</h4>
          <div className="space-y-2">
            <button className="w-full px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] transition-colors text-sm text-white text-right flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#59D8C3]" />
              بستن گفتگو
            </button>
            <button className="w-full px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] transition-colors text-sm text-white text-right flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#59D8C3]" />
              انتقال به همکار دیگر
            </button>
            <button className="w-full px-4 py-2.5 rounded-lg bg-[rgba(255,107,107,0.1)] border border-[rgba(255,107,107,0.2)] hover:bg-[rgba(255,107,107,0.15)] transition-colors text-sm text-red-400 text-right flex items-center gap-2">
              <Flag className="w-4 h-4" />
              گزارش مشکل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}