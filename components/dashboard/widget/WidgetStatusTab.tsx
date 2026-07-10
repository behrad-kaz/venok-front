// components/dashboard/widget/WidgetStatusTab.tsx

"use client";

import { useState } from 'react';
import { Copy, Power, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { WidgetConfig } from './types';

interface WidgetStatusTabProps {
  config: WidgetConfig;
  onToggleStatus: () => void;
  onAddDomain: (domain: string) => void;
  onRemoveDomain: (domain: string) => void;
}

const widgetCode = (workspaceId: number) => 
  `<script src="https://chat.example.com/widget.js" data-workspace="${workspaceId}"></script>`;

export default function WidgetStatusTab({
  config,
  onToggleStatus,
  onAddDomain,
  onRemoveDomain,
}: WidgetStatusTabProps) {
  const [copied, setCopied] = useState(false);
  const [newDomain, setNewDomain] = useState('');

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(widgetCode(config.workspaceId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddDomain = () => {
    if (newDomain.trim()) {
      onAddDomain(newDomain.trim());
      setNewDomain('');
    }
  };

  return (
    <div className="space-y-6">
      {/* وضعیت ویجت */}
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">وضعیت ویجت</h3>
          <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs ${
            config.isActive
              ? "bg-[rgba(91,224,168,0.12)] text-[#5be0a8] border-[rgba(91,224,168,0.28)]"
              : "bg-[rgba(111,136,128,0.12)] text-gray-400 border-[rgba(111,136,128,0.22)]"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.isActive ? "bg-[#5be0a8]" : "bg-gray-500"}`} />
            {config.isActive ? "فعال" : "غیرفعال"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
            <p className="text-xs text-gray-500 mb-1">شناسه Workspace</p>
            <p className="text-sm font-medium text-white">{config.workspaceId}</p>
          </div>
          <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
            <p className="text-xs text-gray-500 mb-1">توکن ویجت</p>
            <p className="text-sm font-medium text-white font-mono text-xs truncate">{config.widgetToken}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onToggleStatus}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              config.isActive
                ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                : "bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg"
            }`}
          >
            <Power className="w-4 h-4" />
            {config.isActive ? "غیرفعال‌سازی ویجت" : "فعال‌سازی ویجت"}
          </button>
        </div>
      </div>

      {/* دامنه‌های مجاز */}
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
        <h3 className="text-base font-bold text-white mb-4">دامنه‌های مجاز</h3>
        <p className="text-sm text-gray-500 mb-4">
          ویجت فقط در این دامنه‌ها فعال خواهد بود.
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="مثال: https://example.com"
            className="flex-1 px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#59D8C3] transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
          />
          <button
            onClick={handleAddDomain}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg transition-all"
          >
            افزودن
          </button>
        </div>

        <div className="space-y-2">
          {config.allowedDomains.length === 0 ? (
            <p className="text-sm text-gray-500">هیچ دامنه‌ای اضافه نشده است</p>
          ) : (
            config.allowedDomains.map((domain) => (
              <div
                key={domain}
                className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]"
              >
                <span className="text-sm text-white font-mono">{domain}</span>
                <button
                  onClick={() => onRemoveDomain(domain)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* کد نصب */}
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
        <h3 className="text-base font-bold text-white mb-2">کد نصب روی سایت</h3>
        <p className="text-sm text-gray-500 mb-5">
          این کد باید قبل از بسته شدن تگ body در سایت قرار بگیرد.
        </p>
        
        <div className="relative mb-5">
          <pre className="p-4 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] text-sm text-[#5BE0A8] font-mono overflow-x-auto" dir="ltr">
            {widgetCode(config.workspaceId)}
          </pre>
          
          <button
            onClick={handleCopyCode}
            className="absolute top-3 left-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-[rgba(255,255,255,0.08)] text-white border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.12)] transition-all flex items-center gap-2"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? "کپی شد!" : "کپی کد"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}