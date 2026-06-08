// components/dashboard/reports/modals/ConversationsReportModal.tsx
"use client";

import { X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConversationsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusDistribution = [
  { label: "باز", count: 28, percentage: 10, color: "#59D8C3" },
  { label: "در انتظار پاسخ", count: 35, percentage: 12, color: "#F2B84B" },
  { label: "پاسخ داده‌شده", count: 156, percentage: 55, color: "#8B7FDF" },
  { label: "بسته‌شده", count: 65, percentage: 23, color: "#9CA3AF" },
];

const topTopics = [
  { id: 1, title: "مشکل پرداخت", count: 78, percentage: 27, trend: "up" },
  { id: 2, title: "پیگیری سفارش", count: 65, percentage: 23, trend: "stable" },
  { id: 3, title: "سوال قبل از خرید", count: 54, percentage: 19, trend: "down" },
  { id: 4, title: "سایر موارد", count: 87, percentage: 31, trend: "stable" },
];

const departmentsData = [
  { id: 1, name: "پشتیبانی", totalTickets: 127, openTickets: 12, avgFirstResponse: "۵ دقیقه", resolutionRate: 92, status: "good" },
  { id: 2, name: "فروش", totalTickets: 86, openTickets: 8, avgFirstResponse: "۸ دقیقه", resolutionRate: 89, status: "normal" },
  { id: 3, name: "مالی", totalTickets: 45, openTickets: 2, avgFirstResponse: "۱۵ دقیقه", resolutionRate: 85, status: "normal" },
  { id: 4, name: "پیگیری سفارش", totalTickets: 26, openTickets: 6, avgFirstResponse: "۲۵ دقیقه", resolutionRate: 72, status: "attention" },
];

const recentImportantConversations = [
  { id: 1, customer: "رضا احمدی", subject: "مشکل پرداخت", priority: "urgent", time: "۵ دقیقه پیش" },
  { id: 2, customer: "سارا محمدی", subject: "پیگیری سفارش", priority: "medium", time: "۱۰ دقیقه پیش" },
  { id: 3, customer: "علی کریمی", subject: "سوال قبل از خرید", priority: "normal", time: "۱۵ دقیقه پیش" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "good":
      return { text: "خوب", color: "bg-[rgba(91,224,168,0.12)] text-[#5be0a8] border-[rgba(91,224,168,0.28)]" };
    case "normal":
      return { text: "عادی", color: "bg-[rgba(111,136,128,0.12)] text-gray-400 border-[rgba(111,136,128,0.22)]" };
    case "attention":
      return { text: "نیازمند توجه", color: "bg-[rgba(242,184,75,0.12)] text-[#f2b84b] border-[rgba(242,184,75,0.28)]" };
    default:
      return { text: "عادی", color: "bg-[rgba(111,136,128,0.12)] text-gray-400 border-[rgba(111,136,128,0.22)]" };
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "urgent":
      return { text: "فوری", color: "bg-[rgba(255,107,107,0.1)] text-red-400" };
    case "medium":
      return { text: "متوسط", color: "bg-[rgba(242,184,75,0.1)] text-[#f2b84b]" };
    default:
      return { text: "عادی", color: "bg-[rgba(139,127,223,0.1)] text-[#8b7fdf]" };
  }
};

const getTrendIcon = (trend: string) => {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-[#59D8C3]" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-gray-500" />;
};

export default function ConversationsReportModal({ isOpen, onClose }: ConversationsReportModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-5xl max-h-[85vh] bg-[rgba(9,22,18,0.98)] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.1)]">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">گزارش تفصیلی گفتگوها</h2>
                <p className="text-xs text-gray-500">تحلیل حجم، وضعیت و موضوعات گفتگوها</p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.04)] border border-transparent hover:border-[rgba(255,255,255,0.1)] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto rtl-scrollbar max-h-[calc(85vh-100px)]">
              <div className="space-y-6">
                {/* توزیع وضعیت گفتگوها */}
                <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
                  <h3 className="text-sm font-bold text-white mb-4">توزیع وضعیت گفتگوها</h3>
                  <div className="space-y-4">
                    <div className="w-full h-12 rounded-xl overflow-hidden flex">
                      {statusDistribution.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-center text-xs font-bold text-white transition-all hover:opacity-80"
                          style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                          title={`${item.label}: ${item.count}`}
                        >
                          {item.percentage}%
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {statusDistribution.map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-xs text-gray-500">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{item.count}</span>
                            <span className="text-xs text-gray-500">({item.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* موضوعات پرتکرار */}
                <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
                  <h3 className="text-sm font-bold text-white mb-4">موضوعات پرتکرار</h3>
                  <div className="space-y-3">
                    {topTopics.map((topic) => (
                      <div key={topic.id} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(89,216,195,0.3)] transition-all">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[rgba(89,216,195,0.08)] border border-[rgba(89,216,195,0.15)] flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-[#59D8C3]">{topic.id}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{topic.title}</p>
                            <p className="text-xs text-gray-500">{topic.count} گفتگو · {topic.percentage}%</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">{getTrendIcon(topic.trend)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* پرترافیک‌ترین دپارتمان‌ها */}
                <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
                  <h3 className="text-sm font-bold text-white mb-4">پرترافیک‌ترین دپارتمان‌ها</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[rgba(255,255,255,0.1)]">
                          <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">دپارتمان</th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">کل گفتگوها</th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">گفتگوهای باز</th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">میانگین اولین پاسخ</th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">نرخ حل‌شدن</th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">وضعیت عملکرد</th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-gray-500"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {departmentsData.map((dept) => {
                          const badge = getStatusBadge(dept.status);
                          return (
                            <tr key={dept.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                              <td className="py-3 px-4"><span className="text-white font-medium">{dept.name}</span></td>
                              <td className="py-3 px-4"><span className="text-white">{dept.totalTickets}</span></td>
                              <td className="py-3 px-4"><span className="text-white">{dept.openTickets}</span></td>
                              <td className="py-3 px-4"><span className="text-white">{dept.avgFirstResponse}</span></td>
                              <td className="py-3 px-4"><span className="text-white">{dept.resolutionRate}%</span></td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs ${badge.color}`}>
                                  {badge.text}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <button className="text-xs font-medium text-[#59D8C3] hover:text-[#6ef3dc] transition-colors">
                                  مشاهده جزئیات
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* گفتگوهای مهم اخیر */}
                <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
                  <h3 className="text-sm font-bold text-white mb-4">گفتگوهای مهم اخیر</h3>
                  <div className="space-y-2">
                    {recentImportantConversations.map((conv) => {
                      const priorityBadge = getPriorityBadge(conv.priority);
                      return (
                        <div key={conv.id} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(89,216,195,0.3)] transition-all">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{conv.customer}</p>
                            <p className="text-xs text-gray-500">{conv.subject}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${priorityBadge.color}`}>
                              {priorityBadge.text}
                            </span>
                            <span className="text-xs text-gray-500">{conv.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}