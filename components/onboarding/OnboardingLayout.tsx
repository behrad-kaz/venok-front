// components/onboarding/OnboardingLayout.tsx
"use client";

import { ReactNode } from "react";
import { Building2 } from "lucide-react";

interface OnboardingLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function OnboardingLayout({ children, title, subtitle }: OnboardingLayoutProps) {
  return (
    <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#08312c] to-[#020504] rtl-scrollbar p-6">
      <div className="min-h-screen flex items-center justify-center p-6" dir="rtl">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#59D8C3]/10 border border-[#59D8C3]/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#59D8C3]" />
              </div>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
            </div>
            <p className="text-sm text-gray-400">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}