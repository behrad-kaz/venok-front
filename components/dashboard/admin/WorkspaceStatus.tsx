// components/dashboard/admin/WorkspaceStatus.tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle, Circle, Code } from "lucide-react";
import Link from "next/link";

interface SetupItem {
  id: number;
  title: string;
  completed: boolean;
}

const setupItems: SetupItem[] = [
  { id: 1, title: "اطلاعات شرکت ثبت شده", completed: true },
  { id: 2, title: "دپارتمان‌ها ساخته شده‌اند", completed: true },
  { id: 3, title: "اعضا اضافه شده‌اند", completed: true },
  { id: 4, title: "موضوع‌ها به دپارتمان‌ها متصل شده‌اند", completed: true },
  { id: 5, title: "ویجت سایت نصب نشده", completed: false },
];

const completedCount = setupItems.filter((item) => item.completed).length;
const totalCount = setupItems.length;
const progress = (completedCount / totalCount) * 100;

export default function WorkspaceStatus() {
  return (
    <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
      <h3 className="text-sm font-bold text-white mb-4">وضعیت راه‌اندازی Workspace</h3>

      {/* نوار پیشرفت */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-gray-500">پیشرفت کلی</span>
          <span className="text-white font-medium">
            {completedCount} از {totalCount}
          </span>
        </div>
        <div className="h-2 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-full bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8]"
          />
        </div>
      </div>

      {/* لیست موارد */}
      <div className="space-y-2.5 mb-4">
        {setupItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="flex items-start gap-2.5"
          >
            {item.completed ? (
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-[rgba(91,224,168,0.15)] border border-[#5BE0A8]">
                <CheckCircle className="w-3 h-3 text-[#5BE0A8]" strokeWidth={3} />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
                <Circle className="w-2 h-2 text-gray-500" />
              </div>
            )}
            <span
              className={`text-sm ${item.completed ? "text-white" : "text-gray-500"}`}
            >
              {item.title}
            </span>
          </motion.div>
        ))}
      </div>

      {/* دکمه اقدام */}
      <div className="pt-3 border-t border-[rgba(255,255,255,0.1)]">
        <p className="text-xs text-gray-500 mb-3">
          برای نمایش دکمه چت روی سایت، ویجت را نصب و پیکربندی کنید.
        </p>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 bg-[rgba(255,255,255,0.05)] text-white border border-[rgba(255,255,255,0.1)] hover:border-[#59D8C3]/40 hover:bg-[rgba(255,255,255,0.08)] px-3 py-1.5 text-xs w-full"
        >
          <Code className="w-3 h-3" />
          رفتن به ویجت سایت
        </Link>
      </div>
    </div>
  );
}