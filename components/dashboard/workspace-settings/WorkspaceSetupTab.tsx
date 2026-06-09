// components/dashboard/workspace-settings/WorkspaceSetupTab.tsx

"use client";

import { SetupItem } from "./types";
import { CheckCircle, Circle } from "lucide-react";

interface WorkspaceSetupTabProps {
  items: SetupItem[];
  completedCount: number;
  totalCount: number;
  onCompleteItem: (itemId: string) => void;
}

export default function WorkspaceSetupTab({ items, completedCount, totalCount, onCompleteItem }: WorkspaceSetupTabProps) {
  const progress = (completedCount / totalCount) * 100;

  return (
    <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <h3 className="text-base font-bold text-white mb-2">وضعیت راه‌اندازی Workspace</h3>
      <p className="text-sm text-gray-500 mb-5">{completedCount} از {totalCount} مرحله تکمیل شده</p>
      
      <div className="mb-6">
        <div className="w-full h-3 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-left" dir="ltr">{Math.round(progress)}%</p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                item.completed
                  ? "bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F]"
                  : "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]"
              }`}>
                {item.completed ? (
                  <CheckCircle className="w-4 h-4" strokeWidth={3} />
                ) : (
                  <Circle className="w-3 h-3 text-gray-500" />
                )}
              </div>
              <p className={`text-sm font-medium ${item.completed ? "text-white" : "text-gray-500"}`}>
                {item.title}
              </p>
            </div>
            {!item.completed && item.action && (
              <button
                onClick={() => onCompleteItem(item.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#59D8C3] hover:bg-[rgba(89,216,195,0.08)] transition-all"
              >
                انجام دادن
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}