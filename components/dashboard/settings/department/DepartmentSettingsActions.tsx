// components/dashboard/settings/department/DepartmentSettingsActions.tsx

"use client";

import { Save, X } from "lucide-react";

interface DepartmentSettingsActionsProps {
  onSave: () => void;
  onCancel: () => void;
}

export default function DepartmentSettingsActions({ onSave, onCancel }: DepartmentSettingsActionsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onSave}
        className="px-6 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg transition-all flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        <span>ذخیره تنظیمات</span>
      </button>
      <button
        onClick={onCancel}
        className="px-6 py-3 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all flex items-center gap-2"
      >
        <X className="w-4 h-4" />
        <span>لغو تغییرات</span>
      </button>
    </div>
  );
}