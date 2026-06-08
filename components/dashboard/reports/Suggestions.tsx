// components/dashboard/reports/Suggestions.tsx
"use client";

import Link from "next/link";
import { Info, AlertTriangle } from "lucide-react";

interface SuggestionsProps {
  suggestions: { id: number; title: string; type: string; link: string; linkText: string }[];
}

export default function Suggestions({ suggestions }: SuggestionsProps) {
  return (
    <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-white">پیشنهادهای عملیاتی</h3>
      </div>
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border text-[#8b7fdf] bg-[rgba(139,127,223,0.1)] border-[rgba(139,127,223,0.2)]">
              {suggestion.type === "info" ? <Info className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white leading-relaxed mb-2">{suggestion.title}</p>
              <Link href={suggestion.link} className="text-xs font-medium text-[#59D8C3] hover:text-[#6ef3dc] transition-colors inline-flex items-center gap-1">
                {suggestion.linkText} ←
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}