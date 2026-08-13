// components/dashboard/admin/RecentConversations.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { memo, useEffect, useState } from "react";
import { api } from "@/services/api-client";

interface Conversation {
  id: number;
  customerName: string;
  phone: string;
  status: "waiting" | "answered" | "open" | "closed";
  title: string;
  department: string;
  time: string;
  lastMessage: string;
  createdAt: string;
}

function RecentConversationsComponent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // تابع محاسبه زمان نسبی
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "چند لحظه پیش";
    if (diffMins < 60) return `${diffMins} دقیقه پیش`;
    if (diffHours < 24) return `${diffHours} ساعت پیش`;
    if (diffDays < 7) return `${diffDays} روز پیش`;
    return date.toLocaleDateString("fa-IR");
  };

  // دریافت آخرین گفتگوهای مهم
  useEffect(() => {
    const fetchRecentConversations = async () => {
      try {
        setIsLoading(true);

        // ✅ دریافت همه گفتگوها با مرتب‌سازی بر اساس createdAt (مجاز در بک‌اند)
        const response = await api.get<{ data: any[] }>(
          "/conversation?sort=createdAt&order=DESC&limit=10"
        );
        const convs = response?.data || [];

        // دریافت دپارتمان‌ها برای نمایش نام دپارتمان
        let teamsMap = new Map();
        try {
          const teamsResponse = await api.get<any[]>("/support/team");
          const teams = Array.isArray(teamsResponse) ? teamsResponse : [];
          teams.forEach((team: any) => {
            teamsMap.set(team.id, team.name);
          });
        } catch (error) {
          console.warn("⚠️ خطا در دریافت دپارتمان‌ها:", error);
        }

        // دریافت Staffها برای نمایش نام اپراتور
        let staffMap = new Map();
        try {
          const staffResponse = await api.get<any[]>("/staff");
          const staffs = Array.isArray(staffResponse) ? staffResponse : [];
          staffs.forEach((staff: any) => {
            staffMap.set(staff.id, staff.name);
          });
        } catch (error) {
          console.warn("⚠️ خطا در دریافت Staffها:", error);
        }

        // تبدیل داده‌ها - مرتب‌سازی مجدد بر اساس آخرین فعالیت (در کلاینت)
        const sortedConvs = [...convs]
          .filter((conv: any) => conv.deletedAt === null)
          .sort((a: any, b: any) => {
            const dateA = a.lastActivity ? new Date(a.lastActivity).getTime() : new Date(a.createdAt).getTime();
            const dateB = b.lastActivity ? new Date(b.lastActivity).getTime() : new Date(b.createdAt).getTime();
            return dateB - dateA;
          })
          .slice(0, 5); // فقط ۵ گفتگوی آخر

        const formatted: Conversation[] = sortedConvs.map((conv: any) => {
          // پیدا کردن اولین پیام مشتری
          const messages = conv.messages || [];
          const firstCustomerMessage = messages
            .filter((msg: any) => msg.senderType === "customer")
            .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

          const title = firstCustomerMessage?.content || conv.subject || "بدون پیام";
          const lastMessage = messages[messages.length - 1]?.content || title;

          // نام دپارتمان
          const departmentName = conv.teamId
            ? teamsMap.get(conv.teamId) || "بدون دپارتمان"
            : "بدون دپارتمان";

          // نام مشتری
          const customerName = conv.customer?.name || conv.customerName || "مشتری ناشناس";
          const phone = conv.customerPhone || conv.customer?.phone || "نامشخص";

          // زمان آخرین فعالیت
          const lastActivity = conv.lastActivity || conv.createdAt || new Date().toISOString();
          const timeAgo = getTimeAgo(lastActivity);

          return {
            id: conv.id,
            customerName,
            phone,
            status: conv.status || "open",
            title,
            department: departmentName,
            time: timeAgo,
            lastMessage,
            createdAt: conv.createdAt,
          };
        });

        setConversations(formatted);
      } catch (error) {
        console.error("❌ خطا در دریافت آخرین گفتگوها:", error);
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentConversations();
  }, []);

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
      case "closed":
        return {
          text: "بسته شده",
          color: "text-gray-400 bg-[rgba(111,136,128,0.12)] border-[rgba(111,136,128,0.22)]",
          dotColor: "bg-gray-500",
        };
      default:
        return {
          text: "نامشخص",
          color: "text-gray-400 bg-[rgba(111,136,128,0.12)] border-[rgba(111,136,128,0.22)]",
          dotColor: "bg-gray-500",
        };
    }
  };

  // نمایش لودینگ
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">آخرین گفتگوهای مهم</h3>
          <Link
            href="/dashboard/conversations"
            className="text-xs text-gray-500 hover:text-[#59D8C3] transition-colors"
          >
            مشاهده همه
          </Link>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] animate-pulse">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded w-1/2 mb-2" />
                  <div className="h-3 bg-[rgba(255,255,255,0.05)] rounded w-1/3" />
                </div>
                <div className="h-6 bg-[rgba(255,255,255,0.05)] rounded w-20" />
              </div>
              <div className="h-3 bg-[rgba(255,255,255,0.05)] rounded w-3/4 mb-2" />
              <div className="flex items-center justify-between">
                <div className="h-3 bg-[rgba(255,255,255,0.05)] rounded w-1/4" />
                <div className="h-3 bg-[rgba(255,255,255,0.05)] rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // اگر گفتگویی وجود نداشت
  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">آخرین گفتگوهای مهم</h3>
          <Link
            href="/dashboard/conversations"
            className="text-xs text-gray-500 hover:text-[#59D8C3] transition-colors"
          >
            مشاهده همه
          </Link>
        </div>
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">هیچ گفتگویی یافت نشد</p>
          <p className="text-gray-500 text-xs mt-1">گفتگوهای جدید در اینجا نمایش داده می‌شوند</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">آخرین گفتگوهای مهم</h3>
        <Link
          href="/dashboard/conversations"
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
                  <p className="text-sm font-semibold text-white truncate">
                    {conv.customerName}
                  </p>
                  <p className="text-xs text-gray-500" dir="ltr">
                    {conv.phone}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs flex-shrink-0 ${badge.color}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${badge.dotColor}`} />
                  {badge.text}
                </span>
              </div>
              <p className="text-xs text-white mb-2 line-clamp-2">
                {conv.title}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{conv.department}</span>
                  <span>·</span>
                  <span>{conv.time}</span>
                </div>
                <Link
                  href={`/dashboard/conversations?conversationId=${conv.id}`}
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

// ✅ استفاده از memo برای جلوگیری از رندر مجدد
export default memo(RecentConversationsComponent);