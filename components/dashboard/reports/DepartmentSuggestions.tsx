"use client";

import Link from "next/link";
import { AlertTriangle, Info } from "lucide-react";

interface Suggestion {
  id: number;
  title: string;
  type: string;
  link: string;
  linkText: string;
}

interface DepartmentSuggestionsProps {
  suggestions: Suggestion[];
}

const getIcon = (type: string) => {
  if (type === "warning") {
    return {
      icon: AlertTriangle,
      color: "#F2B84B",
      bgColor: "rgba(242,184,75,0.1)",
      borderColor: "rgba(242,184,75,0.2)",
    };
  }
  return {
    icon: Info,
    color: "#8B7FDF",
    bgColor: "rgba(139,127,223,0.1)",
    borderColor: "rgba(139,127,223,0.2)",
  };
};

export default function DepartmentSuggestions({ suggestions }: DepartmentSuggestionsProps) {
  return (
    <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-white">پیشنهادهای مدیریتی</h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion) => {
          const { icon: Icon, color, bgColor, borderColor } = getIcon(suggestion.type);
          return (
            <div
              key={suggestion.id}
              className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border"
                style={{ color, backgroundColor: bgColor, borderColor }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white leading-relaxed mb-2">{suggestion.title}</p>
                <Link
                  href={suggestion.link}
                  className="text-xs font-medium text-[#59D8C3] hover:text-[#6ef3dc] transition-colors inline-flex items-center gap-1"
                >
                  {suggestion.linkText} ←
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}