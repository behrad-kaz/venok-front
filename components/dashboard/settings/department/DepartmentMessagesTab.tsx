// components/dashboard/settings/department/DepartmentMessagesTab.tsx

"use client";

import { DepartmentMessages } from "./types";

interface DepartmentMessagesTabProps {
  messages: DepartmentMessages;
  onMessagesChange: (messages: DepartmentMessages) => void;
}

export default function DepartmentMessagesTab({ messages, onMessagesChange }: DepartmentMessagesTabProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-white">پیام‌های دپارتمان</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">پیام خوشامد دپارتمان</label>
            <textarea
              rows={2}
              value={messages.welcome}
              onChange={(e) => onMessagesChange({ ...messages, welcome: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">پیام انتظار برای اولین پاسخ</label>
            <textarea
              rows={2}
              value={messages.waiting}
              onChange={(e) => onMessagesChange({ ...messages, waiting: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">پیام خارج از ساعات کاری</label>
            <textarea
              rows={2}
              value={messages.outOfHours}
              onChange={(e) => onMessagesChange({ ...messages, outOfHours: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">پیام بسته‌شدن گفتگو</label>
            <textarea
              rows={2}
              value={messages.closed}
              onChange={(e) => onMessagesChange({ ...messages, closed: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all resize-none"
            />
          </div>
        </div>
        <div className="p-5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] h-fit">
          <p className="text-xs text-gray-500 mb-4">پیش‌نمایش پیام‌ها در چت مشتری:</p>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)]">
              <p className="text-[10px] text-gray-500 mb-1">پیام خوشامد:</p>
              <p className="text-xs text-white">{messages.welcome}</p>
            </div>
            <div className="p-3 rounded-xl bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)]">
              <p className="text-[10px] text-gray-500 mb-1">انتظار برای پاسخ:</p>
              <p className="text-xs text-white">{messages.waiting}</p>
            </div>
            <div className="p-3 rounded-xl bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)]">
              <p className="text-[10px] text-gray-500 mb-1">خارج از ساعات کاری:</p>
              <p className="text-xs text-white">{messages.outOfHours}</p>
            </div>
            <div className="p-3 rounded-xl bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)]">
              <p className="text-[10px] text-gray-500 mb-1">بسته‌شدن گفتگو:</p>
              <p className="text-xs text-white">{messages.closed}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}