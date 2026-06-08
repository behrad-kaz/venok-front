// components/dashboard/manager/data.ts
import { DepartmentStats, AttentionItem, QueueStatus, DepartmentMember, RecentConversation, TrendData } from "./types";

export const departmentStats: DepartmentStats = {
  openTickets: 12,
  waitingResponse: 3,
  avgResponseTime: "۴ دقیقه",
  onlineMembers: 3,
  totalMembers: 4,
};

export const attentionItems: AttentionItem[] = [
  { id: 1, title: "۳ گفتگو بیشتر از ۱۰ دقیقه بدون پاسخ مانده‌اند.", buttonText: "مشاهده گفتگوها", buttonLink: "/dashboard/conversations", type: "danger" },
  { id: 2, title: "علی رضایی ۷ گفتگوی باز دارد و نیاز به پشتیبانی دارد.", buttonText: "بررسی اعضا", buttonLink: "/dashboard/members", type: "warning" },
  { id: 3, title: "امروز حجم گفتگوها ۲۵٪ بیشتر از میانگین هفته است.", buttonText: "مشاهده گزارش", buttonLink: "/dashboard/reports", type: "info" },
  { id: 4, title: "۲ گفتگو هنوز مسئول مشخص ندارند.", buttonText: "تخصیص مسئول", buttonLink: "/dashboard/conversations", type: "warning" },
];

export const queueStatus: QueueStatus = {
  newTickets: 5,
  inProgress: 8,
  unassigned: 2,
  closedToday: 15,
};

export const departmentMembers: DepartmentMember[] = [
  { id: 1, name: "علی رضایی", initial: "ع", status: "online", openTickets: 7, avgResponseTime: "۳ دقیقه", lastActivity: "۲ دقیقه پیش", workStatus: "busy" },
  { id: 2, name: "مریم احمدی", initial: "م", status: "online", openTickets: 3, avgResponseTime: "۵ دقیقه", lastActivity: "۵ دقیقه پیش", workStatus: "normal" },
  { id: 3, name: "حسین کریمی", initial: "ح", status: "online", openTickets: 2, avgResponseTime: "۴ دقیقه", lastActivity: "۱ دقیقه پیش", workStatus: "normal" },
  { id: 4, name: "زهرا محمودی", initial: "ز", status: "offline", openTickets: 0, avgResponseTime: "۶ دقیقه", lastActivity: "۲ ساعت پیش", workStatus: "normal" },
];

export const recentConversations: RecentConversation[] = [
  { id: 1, customerName: "احمد نوری", customerPhone: "09121234567", subject: "مشکل پرداخت", assignee: "علی رضایی", status: "waiting", lastActivity: "۵ دقیقه پیش", isUrgent: true },
  { id: 2, customerName: "فاطمه حسینی", customerPhone: "09127654321", subject: "پیگیری سفارش", assignee: "مریم احمدی", status: "answered", lastActivity: "۱۵ دقیقه پیش", isUrgent: false },
  { id: 3, customerName: "محمد رضایی", customerPhone: "09129876543", subject: "سوال قبل از خرید", assignee: "", status: "open", lastActivity: "۲۰ دقیقه پیش", isUrgent: true },
  { id: 4, customerName: "سارا کریمی", customerPhone: "09123456789", subject: "پیگیری سفارش", assignee: "حسین کریمی", status: "open", lastActivity: "۳۰ دقیقه پیش", isUrgent: false },
];

export const trendData: TrendData[] = [
  { day: "شنبه", new: 8, solved: 6 },
  { day: "یکشنبه", new: 12, solved: 10 },
  { day: "دوشنبه", new: 15, solved: 13 },
  { day: "سه‌شنبه", new: 10, solved: 11 },
  { day: "چهارشنبه", new: 14, solved: 12 },
  { day: "پنجشنبه", new: 11, solved: 10 },
  { day: "امروز", new: 18, solved: 8 },
];