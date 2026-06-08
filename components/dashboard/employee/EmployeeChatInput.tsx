"use client";

import { useState } from "react";
import { MessageCircle, Send, StickyNote } from "lucide-react";

interface EmployeeChatInputProps {
  onSendMessage: (message: string, isInternalNote: boolean) => void;
}

type InputMode = "customer" | "internal";

export default function EmployeeChatInput({ onSendMessage }: EmployeeChatInputProps) {
  const [newMessage, setNewMessage] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("customer");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage, inputMode === "internal");
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMode = () => {
    setInputMode(inputMode === "customer" ? "internal" : "customer");
    setNewMessage("");
  };

  const isInternalMode = inputMode === "internal";
  const buttonText = isInternalMode ? "یادداشت داخلی (فقط برای شما)" : "پاسخ به مشتری";
  const IconComponent = isInternalMode ? StickyNote : MessageCircle;
  const buttonClass = isInternalMode
    ? "bg-[rgba(242,184,75,0.12)] text-[#f2b84b] border border-[rgba(242,184,75,0.3)]"
    : "bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white";
  const textareaPlaceholder = isInternalMode
    ? "یادداشت داخلی بنویسید..."
    : "پیام خود را بنویسید...";

  return (
    <div className="p-4 border-t border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.01)] rounded-b-2xl">
      <div className="mb-3">
        <button
          onClick={toggleMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${buttonClass}`}
        >
          <IconComponent className="w-3.5 h-3.5" />
          {buttonText}
        </button>
      </div>
      <div className="flex gap-2">
        <textarea
          placeholder={textareaPlaceholder}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-h-[44px] max-h-[120px] px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#59D8C3]/50 resize-none"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim()}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[10px] text-gray-500 mt-2">Enter برای ارسال • Shift + Enter برای خط جدید</p>
    </div>
  );
}