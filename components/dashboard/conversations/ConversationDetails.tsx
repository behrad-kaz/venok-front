'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, Users } from 'lucide-react';
import { Conversation } from './types';
import { getStatusBadge } from './data';
import { UserRole } from '@/stores/useRoleStore';
import { AssignModal } from './AssignModal';

interface AssignableEmployee {
  id: number;
  name: string;
  department: string;
  tickets: number;
  role?: string;
  departmentId?: number;
}

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
  assignableEmployees?: AssignableEmployee[];
  onAssignConversation?: (staffId: number) => void;
  isAdmin?: boolean;
  isManager?: boolean;
  departmentName?: string;
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
  assignableEmployees = [],
  onAssignConversation,
  isAdmin = false,
  isManager = false,
  departmentName = '',
}: ConversationDetailsProps) {
  const badge = getStatusBadge(conversation.status);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  
  const showBackButton = isMobile || isTablet;
  const isFullWidth = isMobile || isTablet;

  // ✅ فیلتر کردن کارمندان بر اساس نقش
  const getFilteredEmployees = () => {
    console.log('🔍 [Details] getFilteredEmployees - isAdmin:', isAdmin, 'isManager:', isManager);
    console.log('📋 [Details] assignableEmployees (ورودی):', assignableEmployees);
    console.log('📌 [Details] departmentName (ورودی):', departmentName);
    
    const employees = Array.isArray(assignableEmployees) ? assignableEmployees : [];
    
    // ✅ اگر مدیر کل است، همه کارمندان را نمایش بده
    if (isAdmin) {
      console.log('👑 [Details] مدیر کل: نمایش همه کارمندان');
      console.log(`👑 [Details] ${employees.length} کارمند برای مدیر کل`);
      return employees;
    }
    
    // ✅ اگر مدیر دپارتمان است، فقط کارمندان دپارتمان خودش را نمایش بده
    if (isManager) {
      const filtered = employees.filter(emp => {
        // اگر کارمند دپارتمان ندارد، به مدیر دپارتمان نشان بده
        if (!emp.department || emp.department === 'بدون دپارتمان') {
          return true;
        }
        // اگر دپارتمان کارمند با دپارتمان مدیر مطابقت دارد
        return emp.department === departmentName;
      });
      console.log(`👔 [Details] مدیر دپارتمان: ${filtered.length} کارمند قابل تخصیص (از ${employees.length} کل)`);
      return filtered;
    }
    
    console.log('ℹ️ [Details] کاربر نه مدیر کل است و نه مدیر دپارتمان');
    return [];
  };

  const filteredEmployees = getFilteredEmployees();

  // ✅ بررسی اینکه آیا دکمه تخصیص باید نمایش داده شود
  const showAssignButton = (isAdmin || isManager) && filteredEmployees.length > 0;
  console.log('🔘 [Details] showAssignButton:', showAssignButton, `(isAdmin=${isAdmin}, isManager=${isManager}, count=${filteredEmployees.length})`);

  const handleAssignClick = () => {
    setIsAssignModalOpen(true);
  };

  const handleAssignConfirm = async (staffId: number) => {
    setIsAssigning(true);
    try {
      if (onAssignConversation) {
        await onAssignConversation(staffId);
      }
      setIsAssignModalOpen(false);
    } catch (error) {
      console.error('❌ خطا در تخصیص:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <>
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
            <p className="text-sm text-white">
              {conversation.customerName || "مشتری ناشناس"}
              {conversation.customerId && (
                <span className="text-xs text-gray-500 mr-2">(ID: {conversation.customerId})</span>
              )}
            </p>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">شماره همراه</label>
            <p className="text-sm text-white" dir="ltr">{conversation.customerPhone || "نامشخص"}</p>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">موضوع</label>
            <p className="text-sm text-white">{conversation.subject || "بدون موضوع"}</p>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">منبع ورود</label>
            <p className="text-sm text-white">{conversation.source || "ویجت سایت"}</p>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">دپارتمان</label>
            <p className="text-sm text-white">{conversation.department || "بدون دپارتمان"}</p>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">مسئول گفتگو</label>
            <p className="text-sm text-white">{conversation.assignee || "تعیین نشده"}</p>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">تاریخ شروع</label>
            <p className="text-sm text-white">{conversation.startDate || "نامشخص"}</p>
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
            
            {/* ✅ دکمه تخصیص با فیلتر بر اساس دپارتمان */}
            {(isAdmin || isManager) && (
              <button
                onClick={handleAssignClick}
                disabled={filteredEmployees.length === 0 || isAssigning}
                className={`w-full px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  filteredEmployees.length > 0 && !isAssigning
                    ? 'bg-[rgba(89,216,195,0.08)] text-[#59D8C3] border border-[rgba(89,216,195,0.15)] hover:bg-[rgba(89,216,195,0.12)]'
                    : 'bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] cursor-not-allowed'
                }`}
              >
                <Users className="w-4 h-4" />
                {filteredEmployees.length === 0 
                  ? 'هیچ کارمندی برای تخصیص وجود ندارد'
                  : conversation.assignee 
                    ? 'تغییر مسئول' 
                    : 'تخصیص / ارجاع'
                }
              </button>
            )}

            <button
              onClick={onCloseConversation}
              className="w-full px-3 py-2 rounded-xl text-sm font-medium bg-[rgba(255,107,107,0.08)] text-red-400 border border-[rgba(255,107,107,0.15)] hover:bg-[rgba(255,107,107,0.12)] transition-all"
            >
              بستن گفتگو
            </button>
          </div>
        </div>
      </div>

      {/* مودال تخصیص */}
      <AssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssignConfirm}
        employees={filteredEmployees}
        currentAssignee={conversation.assignee || undefined}
        isAdmin={isAdmin}
        departmentName={departmentName}
        isLoading={isAssigning}
      />
    </>
  );
}