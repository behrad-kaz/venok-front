// components/dashboard/manager/AttentionNeeded.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { AttentionItem } from "./types";

interface AttentionNeededProps {
  items: AttentionItem[];
}

const getIcon = (type: string) => {
  switch (type) {
    case "danger":
      return <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-[#F2B84B] flex-shrink-0 mt-0.5" />;
    case "info":
      return <Info className="w-5 h-5 text-[#4dabf7] flex-shrink-0 mt-0.5" />;
    default:
      return <AlertCircle className="w-5 h-5 text-[#F2B84B] flex-shrink-0 mt-0.5" />;
  }
};

const getBorderColor = (type: string) => {
  switch (type) {
    case "danger":
      return "border-[rgba(255,107,107,0.3)] bg-[rgba(255,107,107,0.05)]";
    case "warning":
      return "border-[rgba(242,184,75,0.3)] bg-[rgba(242,184,75,0.05)]";
    case "info":
      return "border-[rgba(77,171,247,0.3)] bg-[rgba(77,171,247,0.05)]";
    default:
      return "border-[rgba(242,184,75,0.3)] bg-[rgba(242,184,75,0.05)]";
  }
};

export default function AttentionNeeded({ items }: AttentionNeededProps) {
  return (
    <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <h3 className="text-base font-bold text-white mb-4">نیازمند توجه</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border ${getBorderColor(item.type)} flex items-start gap-3`}
          >
            {getIcon(item.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white mb-2">{item.title}</p>
              <Link href={item.buttonLink} className="text-xs font-medium text-[#59D8C3] hover:text-[#4dc7b5] transition-colors">
                {item.buttonText}
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}