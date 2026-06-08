// components/dashboard/employee/EmployeeChatMessages.tsx

"use client";

import { AlertCircle } from "lucide-react";
import { Message } from "./types";

interface EmployeeChatMessagesProps {
  messages: Message[];
  source: string;
}

export default function EmployeeChatMessages({ messages, source }: EmployeeChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[rgba(255,255,255,0.05)] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.3)] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.5)] py-4 space-y-4">
      {/* منبع شروع گفتگو */}
      <div className="flex justify-center my-4">
        <div className="px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
          <p className="text-xs text-gray-500">گفتگو از طریق {source} شروع شد</p>
        </div>
      </div>

      {messages.map((msg) => (
        <div key={msg.id}>
          {msg.isInternalNote ? (
            <div className="my-3 px-4">
              <div className="p-3 rounded-lg bg-[rgba(242,184,75,0.08)] border border-[rgba(242,184,75,0.2)]">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-[#f2b84b]" />
                  <span className="text-[10px] font-medium text-[#f2b84b]">یادداشت داخلی</span>
                  <span className="text-[10px] text-gray-500 mr-auto">{msg.time}</span>
                </div>
                <p className="text-xs text-white">{msg.text}</p>
                <p className="text-[10px] text-gray-500 mt-1">نویسنده: {msg.senderName}</p>
              </div>
            </div>
          ) : (
            <div className={`flex ${msg.isSupport ? "justify-start" : "justify-end"} mb-3 px-4`}>
              <div className={`max-w-[70%] ${msg.isSupport ? "" : "items-end"}`}>
                <p className={`text-[10px] text-gray-500 mb-1 ${msg.isSupport ? "text-right" : "text-left"}`}>
                  {msg.senderName}
                </p>
                <div className={`p-3 rounded-2xl ${
                  msg.isSupport
                    ? "bg-[rgba(89,216,195,0.12)] border border-[rgba(89,216,195,0.2)] rounded-tr-sm"
                    : "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-tl-sm"
                }`}>
                  <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
                <p className={`text-[10px] text-gray-500 mt-1 ${msg.isSupport ? "text-right" : "text-left"}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}