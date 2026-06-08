// components/dashboard/admin/AttentionNeeded.tsx
"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Info, UserMinus, Code } from "lucide-react";
import Link from "next/link";

interface AttentionItem {
  id: number;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  type: "warning" | "info";
}

const attentionItems: AttentionItem[] = [
  {
    id: 1,
    title: "گفتگوهای بدون پاسخ بیش از ۱۰ دقیقه",
    description: "۵ گفتگو بیش از ۱۰ دقیقه است که منتظر اولین پاسخ هستند",
    buttonText: "مشاهده گفتگوها",
    buttonLink: "/dashboard/conversations",
    type: "warning",
  },
  {
    id: 2,
    title: "صف شلوغ در دپارتمان پشتیبانی",
    description: "۱۲ گفتگوی باز و فقط ۲ عضو آنلاین",
    buttonText: "بررسی دپارتمان",
    buttonLink: "/dashboard/departments",
    type: "warning",
  },
  {
    id: 3,
    title: "چند گفتگو بدون مسئول مشخص",
    description: "۳ گفتگو هنوز به کسی اختصاص داده نشده‌اند",
    buttonText: "مشاهده گفتگوها",
    buttonLink: "/dashboard/conversations",
    type: "info",
  },
  {
    id: 4,
    title: "نصب ویجت سایت هنوز کامل نشده",
    description: "برای دریافت درخواست از مشتریان، ویجت را نصب کنید",
    buttonText: "تکمیل ویجت",
    buttonLink: "/dashboard/settings",
    type: "info",
  },
];

export default function AttentionNeeded() {
  return (
    <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-[#F2B84B]" />
        <h3 className="text-sm font-bold text-white">نیازمند توجه</h3>
      </div>

      <div className="space-y-2">
        {attentionItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                item.type === "warning"
                  ? "bg-[rgba(242,184,75,0.1)] text-[#F2B84B]"
                  : "bg-[rgba(89,216,195,0.1)] text-[#59D8C3]"
              }`}
            >
              {item.type === "warning" ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <Info className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white mb-0.5">{item.title}</p>
              <p className="text-xs text-gray-500 mb-2">{item.description}</p>
              <Link
                href={item.buttonLink}
                className="text-xs text-[#59D8C3] hover:text-[#6ef3dc] font-medium transition-colors inline-flex items-center gap-1"
              >
                {item.buttonText} ←
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}