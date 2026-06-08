"use client";

import Link from "next/link";
import { Users, ChevronLeft, AlertCircle } from "lucide-react";
import { DepartmentInfo } from "./types";

interface DepartmentInfoTabProps {
  info: DepartmentInfo;
  onInfoChange: (info: DepartmentInfo) => void;
}

export default function DepartmentInfoTab({ info, onInfoChange }: DepartmentInfoTabProps) {
  const toggleStatus = () => {
    onInfoChange({ ...info, status: !info.status });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-white">اطلاعات دپارتمان</h3>

      {/* هشدار غیرفعال بودن دپارتمان */}
      {!info.status && (
        <div className="mb-2 p-4 rounded-xl bg-[rgba(242,184,75,0.08)] border border-[rgba(242,184,75,0.15)]">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#f2b84b] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#f2b84b]">
              این دپارتمان غیرفعال است و گفتگوهای جدید به آن ارسال نمی‌شود.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              نام دپارتمان <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={info.name}
              onChange={(e) => onInfoChange({ ...info, name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">توضیح کوتاه</label>
            <textarea
              rows={3}
              value={info.description}
              onChange={(e) => onInfoChange({ ...info, description: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all resize-none"
            />
          </div>
          <label className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] cursor-pointer">
            <span className="text-sm font-medium text-white">وضعیت دپارتمان: {info.status ? "فعال" : "غیرفعال"}</span>
            <button
              type="button"
              onClick={toggleStatus}
              className={`relative w-11 h-6 rounded-full transition-all ${info.status ? "bg-[#59D8C3]" : "bg-gray-600"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${info.status ? "right-0.5" : "left-0.5"}`} />
            </button>
          </label>
        </div>
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
            <p className="text-xs text-gray-500 mb-4">اطلاعات دپارتمان:</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">مدیر دپارتمان</p>
                <p className="text-sm font-medium text-white">{info.manager}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">تعداد اعضا</p>
                <p className="text-sm font-medium text-white">{info.memberCount}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">گفتگوهای باز</p>
                <p className="text-sm font-medium text-white">{info.openTickets}</p>
              </div>
            </div>
          </div>
          <Link
            href="/dashboard/members"
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>مشاهده اعضای دپارتمان</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}