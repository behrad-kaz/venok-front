// components/dashboard/conversations/ConversationChat.tsx
"use client";

import { Send, Paperclip, Edit, ChevronRight } from "lucide-react";
import { Conversation } from "./types";
import { getStatusBadge } from "./data";
import { UserRole } from "@/stores/useRoleStore";

interface AssignableEmployee {
  id: number;
  name: string;
  department: string;
  tickets: number;
}

interface ConversationChatProps {
  conversation: Conversation;
  newMessage: string;
  showDetails: boolean;
  onNewMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onToggleDetails: () => void;
  onBack: () => void;
  isMobile: boolean;
  isTablet?: boolean;
  role: UserRole;
  assignableEmployees?: AssignableEmployee[];
}

export default function ConversationChat({
  conversation,
  newMessage,
  showDetails,
  onNewMessageChange,
  onSendMessage,
  onToggleDetails,
  onBack,
  isMobile,
  isTablet = false,
  role,
  assignableEmployees,
}: ConversationChatProps) {
  const badge = getStatusBadge(conversation.status);
  
  // نمایش دکمه بازگشت در تبلت و موبایل
  const showBackButton = isMobile || isTablet;

  return (
    <div className="h-full flex flex-col rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] overflow-hidden">
      {/* هدر گفتگو */}
      <div className="p-4 border-b border-[rgba(255,255,255,0.1)] bg-[rgba(9,22,18,0.8)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={onBack}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            <span className="relative inline-flex flex-shrink-0">
              <span className="rounded-full inline-flex items-center justify-center font-semibold bg-[rgba(89,216,195,0.14)] text-[#59D8C3] border border-[rgba(89,216,195,0.2)] w-9 h-9 text-xs">
                {conversation.customerInitial}
              </span>
              <span className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full border-2 border-[rgba(9,22,18,0.8)] bg-[#5be0a8]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">{conversation.customerName}</h3>
                <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs ${badge.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full text-xs flex-shrink-0 ${badge.dotColor}`} />
                  {badge.text}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {conversation.department} · {conversation.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={onToggleDetails}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
              showDetails
                ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-gray-500 hover:text-white hover:border-[rgba(255,255,255,0.2)]"
            }`}
          >
            اطلاعات گفتگو
          </button>
        </div>
      </div>

      {/* پیام‌ها */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.isSupport ? "flex-row-reverse" : "flex-row"}`}>
            <div className="flex flex-col max-w-[85%]">
              <span className={`text-xs text-gray-500 mb-1 ${msg.isSupport ? "text-left" : ""}`}>
                {msg.senderName}
              </span>
              <div className={`px-4 py-3 rounded-2xl ${
                msg.isSupport
                  ? "bg-[rgba(89,216,195,0.12)] border border-[rgba(89,216,195,0.2)]"
                  : "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]"
              }`}>
                <p className={`text-sm leading-relaxed ${msg.isSupport ? "text-[#59D8C3]" : "text-white"}`}>
                  {msg.text}
                </p>
              </div>
              <span className={`text-[10px] text-gray-500 mt-1 ${msg.isSupport ? "text-left" : ""}`}>
                {msg.time}
              </span>
            </div>
          </div>
        ))}

        {/* پیام سیستم ارجاع */}
        <div className="flex justify-center my-4">
          <div className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
            <p className="text-xs text-gray-500 text-center">
              گفتگو به دپارتمان {conversation.department} ارجاع شد
            </p>
          </div>
        </div>
      </div>

      {/* ورودی پیام */}
      <div className="border-t border-[rgba(255,255,255,0.1)] bg-[rgba(9,22,18,0.95)] p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              placeholder="پیام خود را بنویسید..."
              value={newMessage}
              onChange={(e) => onNewMessageChange(e.target.value)}
              rows={1}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
              style={{ maxHeight: "120px", minHeight: "48px" }}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && onSendMessage()}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onSendMessage}
              disabled={!newMessage.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}