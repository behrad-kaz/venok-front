// components/dashboard/widget/WidgetTabs.tsx

"use client";

import { CheckCircle, Palette, FileText, Eye } from "lucide-react";
import { WidgetTabType } from "./types";

interface WidgetTabsProps {
  activeTab: WidgetTabType;
  onTabChange: (tab: WidgetTabType) => void;
}

const tabs: { id: WidgetTabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "status", label: "وضعیت و نصب", icon: CheckCircle },
  { id: "appearance", label: "ظاهر ویجت", icon: Palette },
  { id: "form", label: "فرم شروع گفتگو", icon: FileText },
  { id: "preview", label: "پیش‌نمایش", icon: Eye },
];

export default function WidgetTabs({ activeTab, onTabChange }: WidgetTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-[rgba(255,255,255,0.05)] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.3)] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.5)] pb-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              isActive
                ? "bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] shadow-md"
                : "bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)]"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}