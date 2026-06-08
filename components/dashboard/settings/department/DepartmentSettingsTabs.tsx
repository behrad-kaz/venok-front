// components/dashboard/settings/department/DepartmentSettingsTabs.tsx

"use client";

import { Info, MessageSquare, Clock, Settings2 } from "lucide-react";
import { TabType, TabItem } from "./types";

interface DepartmentSettingsTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: TabItem[] = [
  { id: "info", label: "اطلاعات دپارتمان", icon: Info },
  { id: "messages", label: "پیام‌های دپارتمان", icon: MessageSquare },
  { id: "hours", label: "ساعات پاسخ‌گویی", icon: Clock },
  { id: "rules", label: "قوانین ورود گفتگو", icon: Settings2 },
];

export default function DepartmentSettingsTabs({ activeTab, onTabChange }: DepartmentSettingsTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
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