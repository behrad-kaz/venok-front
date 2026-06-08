// components/dashboard/employee/EmployeeConversationList.tsx

"use client";

import { Conversation } from "./types";
import { statusConfig } from "./data";

interface EmployeeConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  statusFilter: string;
  onSelectConversation: (conversation: Conversation) => void;
  onStatusFilterChange: (filter: string) => void;
}

const filters = [
  { id: "all", label: "همه" },
  { id: "open", label: "باز" },
  { id: "waiting", label: "در انتظار پاسخ" },
  { id: "answered", label: "پاسخ داده‌شده" },
  { id: "closed", label: "بسته‌شده" },
];

export default function EmployeeConversationList({
  conversations,
  selectedConversation,
  statusFilter,
  onSelectConversation,
  onStatusFilterChange,
}: EmployeeConversationListProps) {
  const getCounts = () => {
    return {
      all: conversations.length,
      open: conversations.filter(c => c.status === "open").length,
      waiting: conversations.filter(c => c.status === "waiting").length,
      answered: conversations.filter(c => c.status === "answered").length,
      closed: conversations.filter(c => c.status === "closed").length,
    };
  };

  const counts = getCounts();

  return (
    <div className="h-full flex flex-col">
      {/* هدر و فیلترها */}
      <div className="p-4 border-b border-[rgba(255,255,255,0.1)]">
        <h2 className="text-lg font-bold text-white mb-3">گفتگوهای من</h2>
        <div className="flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-[rgba(255,255,255,0.05)] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.3)] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.5)] pb-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onStatusFilterChange(filter.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === filter.id
                  ? "bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F]"
                  : "bg-[rgba(255,255,255,0.03)] text-gray-500 hover:text-white"
              }`}
            >
              {filter.label} ({counts[filter.id as keyof typeof counts]})
            </button>
          ))}
        </div>
      </div>

      {/* لیست گفتگوها */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[rgba(255,255,255,0.05)] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.3)] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.5)]">
        {conversations.map((conv) => {
          const status = statusConfig[conv.status];
          const isSelected = selectedConversation?.id === conv.id;
          return (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className={`w-full p-4 text-right transition-all border-b border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.03)] ${
                isSelected ? "bg-[rgba(89,216,195,0.08)] border-r-2 border-r-[#59D8C3]" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-white truncate">{conv.customerName}</h4>
                    {conv.isUrgent && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 truncate" dir="ltr">{conv.customerPhone}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[10px] text-gray-500 whitespace-nowrap">{conv.time}</span>
                  {conv.unreadCount && (
                    <span className="min-w-[18px] h-[18px] rounded-full bg-[#59D8C3] text-[#06110F] text-[10px] font-bold flex items-center justify-center px-1">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${status.color}`}>
                  {status.label}
                </span>
                <span className="text-[10px] text-gray-500 truncate">{conv.subject}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}