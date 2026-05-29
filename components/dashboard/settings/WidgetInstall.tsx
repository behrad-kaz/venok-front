// components/dashboard/settings/WidgetInstall.tsx
"use client";

import { Code, Copy, Check } from "lucide-react";
import { useState } from "react";

interface WidgetInstallProps {
  isActive: boolean;
  onToggle: () => void;
}

const widgetCode = `<script src="https://widget.payeshban.ir/embed.js" data-key="pk_live_abc123xyz789" async></script>`;

export default function WidgetInstall({ isActive, onToggle }: WidgetInstallProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(widgetCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-5">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-[#59D8C3]" />
          <h3 className="text-sm font-semibold text-white">نصب ویجت</h3>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">کد ویجت پشتیبانی را در سایت خود قرار دهید</p>
      </div>

      <div className="relative p-3 bg-[rgba(0,0,0,0.3)] rounded-xl border border-[#59D8C3]/20 mb-3">
        <code className="text-[11px] text-[#5BE0A8] font-mono break-all leading-relaxed">
          {widgetCode}
        </code>
        <button
          onClick={handleCopy}
          className="absolute top-3 left-2 px-2 py-1 rounded-lg text-xs bg-[#12251F] text-gray-400 hover:text-white transition-colors"
        >
          
          <span className="mr-1">{isCopied ? "کپی شد" : "کپی"}</span>
        </button>
      </div>

      <p className="text-xs text-gray-500">
        این کد را قبل از تگ <code className="text-[#59D8C3]">&lt;/body&gt;</code> در سایت خود قرار دهید.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={onToggle}
          className="relative w-10 h-5.5 rounded-full transition-colors duration-200"
          style={{ backgroundColor: isActive ? "#59D8C3" : "#4B5563", height: "22px" }}
        >
          <span
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
            style={{ left: isActive ? "calc(100% - 18px)" : "2px" }}
          />
        </button>
        <span className="text-sm text-white">ویجت فعال است</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs bg-[#5BE0A8]/10 text-[#5BE0A8] border-[#5BE0A8]/30">
          {isActive ? "فعال" : "غیرفعال"}
        </span>
      </div>
    </div>
  );
}