// components/onboarding/OnboardingSteps.tsx
"use client";

import { CheckCircle } from "lucide-react";
import { Step } from "./types";

interface OnboardingStepsProps {
  steps: Step[];
  currentStep: number;
}

export default function OnboardingSteps({ steps, currentStep }: OnboardingStepsProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
                currentStep > step.id
                  ? "bg-[#59D8C3] border-[#59D8C3] text-[#06110F]"
                  : currentStep === step.id
                  ? "bg-[rgba(89,216,195,0.15)] border-[#59D8C3] text-[#59D8C3]"
                  : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-gray-500"
              }`}
            >
              {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
            </div>
            <span
              className={`text-xs whitespace-nowrap ${
                currentStep >= step.id ? "text-white font-medium" : "text-gray-500"
              }`}
            >
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 rounded-full mx-1 mb-6 transition-all ${
                currentStep > step.id ? "bg-[#59D8C3]" : "bg-[rgba(255,255,255,0.1)]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}