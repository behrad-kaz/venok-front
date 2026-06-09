// components/dashboard/widget/WidgetUnsavedAlert.tsx

"use client";

import { AlertCircle } from "lucide-react";

interface WidgetUnsavedAlertProps {
  onSave: () => void;
}

export default function WidgetUnsavedAlert({ onSave }: WidgetUnsavedAlertProps) {
  return (
    <div className="p-4 rounded-2xl bg-[rgba(242,184,75,0.08)] border border-[rgba(242,184,75,0.15)] flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-[#f2b84b] flex-shrink-0" />
        <p className="text-sm font-medium text-[#f2b84b]">
          تغییرات ذخیره‌نشده دارید. قبل از خروج، تغییرات را ذخیره کنید.
        </p>
      </div>
      <button
        onClick={onSave}
        className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg transition-all"
      >
        ذخیره تغییرات
      </button>
    </div>
  );
}