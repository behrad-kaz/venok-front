// components/dashboard/workspace-settings/WorkspaceSettingsTabs.tsx

"use client";

import { 
  Building2, 
  Headphones, 
  Clock, 
  Bell, 
  Shield, 
  CheckCircle 
} from "lucide-react";
import { WorkspaceTabType } from "./types";

interface WorkspaceSettingsTabsProps {
  activeTab: WorkspaceTabType;
  onTabChange: (tab: WorkspaceTabType) => void;
}

const tabs: { id: WorkspaceTabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "company", label: "اطلاعات شرکت", icon: Building2 },
  { id: "support", label: "اطلاعات پشتیبانی", icon: Headphones },
  { id: "hours", label: "ساعات کاری", icon: Clock },
  { id: "notifications", label: "اعلان‌ها و پیامک", icon: Bell },
  { id: "security", label: "امنیت و نشست‌ها", icon: Shield },
  { id: "setup", label: "وضعیت راه‌اندازی", icon: CheckCircle },
];

export default function WorkspaceSettingsTabs({ activeTab, onTabChange }: WorkspaceSettingsTabsProps) {
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