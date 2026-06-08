// components/dashboard/employee/EmployeeChatHeader.tsx

"use client";

import { Info } from "lucide-react";
import { Conversation } from "./types";
import { statusConfig } from "./data";

interface EmployeeChatHeaderProps {
  conversation: Conversation;
  currentUser: string;
  currentUserInitial: string;
  onToggleDetails: () => void;
}

export default function EmployeeChatHeader({
  conversation,
  currentUser,
  currentUserInitial,
  onToggleDetails,
}: EmployeeChatHeaderProps) {
  const status = statusConfig[conversation.status];

  return (
    <div className="p-4 border-b border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.01)] rounded-t-2xl flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-bold text-white truncate">{conversation.customerName}</h3>
          {conversation.isUrgent && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-gray-500" dir="ltr">{conversation.customerPhone}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${status.color}`}>
            {status.label}
          </span>
          <span className="text-xs text-gray-500">{conversation.subject}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-left">
          <p className="text-xs font-medium text-white">{currentUser}</p>
          <p className="text-[10px] text-gray-500">{conversation.department}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[rgba(89,216,195,0.12)] border border-[#59D8C3] flex items-center justify-center">
          <span className="text-sm font-bold text-[#59D8C3]">{currentUserInitial}</span>
        </div>
        <button
          onClick={onToggleDetails}
          className="w-9 h-9 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center justify-center flex-shrink-0"
        >
          <Info className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}