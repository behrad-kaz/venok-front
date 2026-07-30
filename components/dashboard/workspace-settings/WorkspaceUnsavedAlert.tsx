// components/dashboard/workspace-settings/WorkspaceUnsavedAlert.tsx
"use client";

import { AlertCircle } from "lucide-react";

interface WorkspaceUnsavedAlertProps {
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export default function WorkspaceUnsavedAlert({ 
  onSave, 
  onCancel, 
  isSaving = false 
}: WorkspaceUnsavedAlertProps) {
  return (
    <div className="p-4 rounded-2xl bg-[rgba(242,184,75,0.08)] border border-[rgba(242,184,75,0.15)] flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-[#f2b84b] flex-shrink-0" />
        <p className="text-sm font-medium text-[#f2b84b]">
          تغییرات ذخیره‌نشده دارید. قبل از خروج، تغییرات را ذخیره کنید.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.05)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          لغو تغییرات
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            isSaving
              ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg'
          }`}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-[#06110F] border-t-transparent rounded-full animate-spin" />
              در حال ذخیره...
            </>
          ) : (
            'ذخیره تغییرات'
          )}
        </button>
      </div>
    </div>
  );
}