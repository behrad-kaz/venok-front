// components/dashboard/settings/AllowedDomains.tsx
"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

interface AllowedDomainsProps {
  domains: string[];
  onUpdate: (domains: string[]) => void;
}

export default function AllowedDomains({ domains, onUpdate }: AllowedDomainsProps) {
  const [newDomain, setNewDomain] = useState("");

  const handleAdd = () => {
    if (newDomain.trim() && !domains.includes(newDomain.trim())) {
      onUpdate([...domains, newDomain.trim()]);
      setNewDomain("");
    }
  };

  const handleRemove = (domain: string) => {
    onUpdate(domains.filter(d => d !== domain));
  };

  return (
    <div className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">دامنه‌های مجاز</h3>
        <p className="text-xs text-gray-500 mt-0.5">فقط این دامنه‌ها اجازه استفاده از ویجت را دارند</p>
      </div>

      <div className="space-y-2 mb-3">
        {domains.map((domain) => (
          <div key={domain} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[#59D8C3]/20">
            <code className="text-sm text-[#59D8C3]">{domain}</code>
            <button onClick={() => handleRemove(domain)} className="text-xs text-gray-400 hover:text-red-400 transition-colors">
              حذف
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          placeholder="دامنه جدید را وارد کنید..."
          className="flex-1 rounded-xl px-3 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-all"
          onKeyPress={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 bg-[#12251F] border border-[#59D8C3]/20 text-gray-300 hover:border-[#59D8C3]/40 hover:text-white px-4 py-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          افزودن
        </button>
      </div>
    </div>
  );
}