// components/dashboard/admin/RecentConversations.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface Conversation {
  id: number;
  customerName: string;
  phone: string;
  status: "waiting" | "answered" | "open";
  title: string;
  department: string;
  time: string;
}

const conversations: Conversation[] = [
  {
    id: 1,
    customerName: "علی محمدی",
    phone: "09121234567",
    status: "waiting",
    title: "مشکل در پرداخت آنلاین",
    department: "مالی",
    time: "۵ دقیقه پیش",
  },
  {
    id: 2,
    customerName: "زهرا احمدی",
    phone: "09132345678",
    status: "answered",
    title: "پیگیری وضعیت سفارش",
    department: "پشتیبانی",
    time: "۱۰ دقیقه پیش",
  },
  {
    id: 3,
    customerName: "حسین رضایی",
    phone: "09153456789",
    status: "open",
    title: "سوال درباره پکیج‌های سفر",
    department: "فروش",
    time: "۱۵ دقیقه پیش",
  },
  {
    id: 4,
    customerName: "مریم کریمی",
    phone: "09194567890",
    status: "waiting",
    title: "درخواست کنسلی رزرو",
    department: "پشتیبانی",
    time: "۲۰ دقیقه پیش",
  },
];

const getStatusBadge = (status: Conversation["status"]) => {
  switch (status) {
    case "waiting":
      return {
        text: "در انتظار پاسخ",
        color: "text-[#F2B84B] bg-[rgba(242,184,75,0.12)] border-[rgba(242,184,75,0.28)]",
        dotColor: "bg-[#F2B84B]",
      };
    case "answered":
      return {
        text: "پاسخ داده شده",
        color: "text-[#5BE0A8] bg-[rgba(91,224,168,0.12)] border-[rgba(91,224,168,0.28)]",
        dotColor: "bg-[#5BE0A8]",
      };
    case "open":
      return {
        text: "باز",
        color: "text-[#59D8C3] bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.3)]",
        dotColor: "bg-[#59D8C3]",
      };
  }
};

export default function RecentConversations() {
  return (
    <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">آخرین گفتگوهای مهم</h3>
        <Link
          href="/dashboard/requests"
          className="text-xs text-gray-500 hover:text-[#59D8C3] transition-colors"
        >
          مشاهده همه
        </Link>
      </div>

      <div className="space-y-3">
        {conversations.map((conv, index) => {
          const badge = getStatusBadge(conv.status);
          return (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(89,216,195,0.3)] transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{conv.customerName}</p>
                  <p className="text-xs text-gray-500" dir="ltr">
                    {conv.phone}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs ${badge.color}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${badge.dotColor}`} />
                  {badge.text}
                </span>
              </div>
              <p className="text-xs text-white mb-2">{conv.title}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{conv.department}</span>
                  <span>·</span>
                  <span>{conv.time}</span>
                </div>
                <Link
                  href={`/dashboard/conversations/${conv.id}`}
                  className="text-xs text-[#59D8C3] hover:text-[#6ef3dc] font-medium transition-colors"
                >
                  مشاهده گفتگو
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}