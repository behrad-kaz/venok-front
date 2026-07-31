'use client';

import { Search, User, Clock, MessageSquare } from "lucide-react";
import { Conversation, StatusFilter } from "./types";
import { getStatusBadge } from "./data";
import { UserRole } from "@/stores/useRoleStore";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  searchQuery: string;
  activeFilter: string;
  showDetails: boolean;
  onSearchChange: (query: string) => void;
  onFilterChange: (filterId: string) => void;
  onSelectConversation: (conversation: Conversation) => void;
  filters: StatusFilter[];
  isMobile?: boolean;
  isTablet?: boolean;
  role: UserRole;
  isLoading?: boolean;
}

export default function ConversationList({
  conversations,
  selectedConversation,
  searchQuery,
  activeFilter,
  showDetails,
  onSearchChange,
  onFilterChange,
  onSelectConversation,
  filters,
  isMobile = false,
  isTablet = false,
  role,
  isLoading = false,
}: ConversationListProps) {
  // نمایش وضعیت لودینگ
  if (isLoading) {
    return (
      <div className="h-full flex flex-col rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#59D8C3] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">در حال بارگذاری گفتگوها...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-full flex flex-col rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] overflow-hidden transition-all duration-300`}
    >
      {/* جستجو */}
      <div className="p-4 border-b border-[rgba(255,255,255,0.1)]">
        <div className="relative">
          <input
            type="text"
            placeholder="جستجو بر اساس شماره، نام مشتری یا موضوع"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* فیلترهای وضعیت */}
      <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.1)] overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-[rgba(255,255,255,0.05)] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.3)] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.5)]">
        <div className="flex gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                activeFilter === filter.id
                  ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                  : "bg-[rgba(255,255,255,0.03)] border-transparent text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
              }`}
            >
              <span>{filter.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeFilter === filter.id
                    ? "bg-[#59D8C3] text-[#06110F]"
                    : "bg-[rgba(255,255,255,0.1)]"
                }`}
              >
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* لیست گفتگوها */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[rgba(255,255,255,0.05)] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.3)] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.5)] p-3 space-y-2">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">هیچ گفتگویی یافت نشد</p>
            <p className="text-gray-500 text-xs mt-1">گفتگوهای جدید در اینجا نمایش داده می‌شوند</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const badge = getStatusBadge(conv.status);
            const isSelected = selectedConversation?.id === conv.id && !showDetails;
            
            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`w-full text-right p-4 rounded-xl transition-all border ${
                  isSelected
                    ? "bg-[rgba(89,216,195,0.08)] border-[rgba(89,216,195,0.2)]"
                    : "bg-[rgba(255,255,255,0.02)] border-transparent hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="relative inline-flex flex-shrink-0">
                    <span className="rounded-full inline-flex items-center justify-center font-semibold bg-[rgba(89,216,195,0.14)] text-[#59D8C3] border border-[rgba(89,216,195,0.2)] w-9 h-9 text-xs">
                      {conv.customerInitial || 'م'}
                    </span>
                    {conv.status === 'waiting' && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">
                          {conv.customerName || 'مشتری ناشناس'}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {conv.subject || 'بدون موضوع'}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap">
                        {conv.time || 'چند لحظه پیش'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                      {conv.lastMessage || 'بدون پیام'}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs ${badge.color}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${badge.dotColor}`}
                          />
                          {badge.text}
                        </span>
                        {conv.department && conv.department !== 'بدون دپارتمان' && (
                          <span className="text-[10px] text-gray-500 px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)]">
                            {conv.department}
                          </span>
                        )}
                        {conv.assignee && (
                          <span className="text-[10px] text-[#59D8C3] px-2 py-0.5 rounded-full bg-[rgba(89,216,195,0.08)]">
                            {conv.assignee}
                          </span>
                        )}
                        {conv.priority === "urgent" && (
                          <span className="text-[10px] text-[#f2b84b] px-2 py-0.5 rounded-full bg-[rgba(242,184,75,0.1)] font-medium">
                            فوری
                          </span>
                        )}
                      </div>
                      {conv.unreadCount && conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#f2b84b] text-[#1c1302] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}