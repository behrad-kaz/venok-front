// components/dashboard/reports/data.ts
import { DepartmentPerformance, MemberPerformance, TrendData } from "./types";

export const departmentsData: DepartmentPerformance[] = [
  { id: 1, name: "پشتیبانی", totalTickets: 127, openTickets: 12, avgFirstResponse: "۵ دقیقه", resolutionRate: 92, status: "good" },
  { id: 2, name: "فروش", totalTickets: 86, openTickets: 8, avgFirstResponse: "۸ دقیقه", resolutionRate: 89, status: "normal" },
  { id: 3, name: "مالی", totalTickets: 45, openTickets: 2, avgFirstResponse: "۱۵ دقیقه", resolutionRate: 85, status: "normal" },
  { id: 4, name: "پیگیری سفارش", totalTickets: 26, openTickets: 6, avgFirstResponse: "۲۵ دقیقه", resolutionRate: 72, status: "attention" },
];

export const membersData: MemberPerformance[] = [
  { id: 1, name: "سارا احمدی", initials: "سا", department: "پشتیبانی", answeredTickets: 48, avgResponseTime: "۳ دقیقه", openTickets: 5, lastActivity: "۲ دقیقه پیش", status: "active" },
  { id: 2, name: "نیلوفر محمدی", initials: "نم", department: "پشتیبانی", answeredTickets: 42, avgResponseTime: "۵ دقیقه", openTickets: 4, lastActivity: "۱ دقیقه پیش", status: "active" },
  { id: 3, name: "امیر حسینی", initials: "اح", department: "فروش", answeredTickets: 38, avgResponseTime: "۷ دقیقه", openTickets: 3, lastActivity: "۵ دقیقه پیش", status: "active" },
  { id: 4, name: "رضا کریمی", initials: "رک", department: "پشتیبانی", answeredTickets: 35, avgResponseTime: "۶ دقیقه", openTickets: 2, lastActivity: "۱۵ دقیقه پیش", status: "active" },
  { id: 5, name: "مهدی رضایی", initials: "مر", department: "مالی", answeredTickets: 28, avgResponseTime: "۱۲ دقیقه", openTickets: 1, lastActivity: "۳۰ دقیقه پیش", status: "active" },
];

export const statsData = {
  totalTickets: 284,
  solvedTickets: 256,
  avgFirstResponse: "۵ دقیقه",
  avgResolutionTime: "۲۳ دقیقه",
  resolutionRate: 90,
};

export const statusDistribution = {
  open: { label: "باز", count: 28, percentage: 10, color: "#59D8C3" },
  waiting: { label: "در انتظار پاسخ", count: 35, percentage: 12, color: "#F2B84B" },
  answered: { label: "پاسخ داده شده", count: 156, percentage: 55, color: "#8B7FDF" },
  closed: { label: "بسته شده", count: 65, percentage: 23, color: "#9CA3AF" },
};

export const trendData: TrendData[] = [
  { day: "شنبه", new: 12, solved: 8 },
  { day: "یکشنبه", new: 15, solved: 11 },
  { day: "دوشنبه", new: 10, solved: 9 },
  { day: "سه‌شنبه", new: 18, solved: 14 },
  { day: "چهارشنبه", new: 14, solved: 12 },
  { day: "پنجشنبه", new: 16, solved: 10 },
  { day: "جمعه", new: 20, solved: 15 },
];

export const topTopics = [
  { id: 1, title: "مشکل پرداخت", count: 78, percentage: 27, trend: "up" },
  { id: 2, title: "پیگیری سفارش", count: 65, percentage: 23, trend: "stable" },
  { id: 3, title: "سوال قبل از خرید", count: 54, percentage: 19, trend: "down" },
  { id: 4, title: "سایر موارد", count: 87, percentage: 31, trend: "stable" },
];

export const peakHours = [
  { hour: "۰۸:۰۰", value: 12, intensity: "low" },
  { hour: "۰۹:۰۰", value: 18, intensity: "low" },
  { hour: "۱۰:۰۰", value: 28, intensity: "medium" },
  { hour: "۱۱:۰۰", value: 35, intensity: "high" },
  { hour: "۱۲:۰۰", value: 42, intensity: "high" },
  { hour: "۱۳:۰۰", value: 38, intensity: "high" },
  { hour: "۱۴:۰۰", value: 45, intensity: "high" },
  { hour: "۱۵:۰۰", value: 48, intensity: "high" },
  { hour: "۱۶:۰۰", value: 40, intensity: "high" },
  { hour: "۱۷:۰۰", value: 32, intensity: "medium" },
  { hour: "۱۸:۰۰", value: 22, intensity: "low" },
  { hour: "۱۹:۰۰", value: 15, intensity: "low" },
];

export const suggestions = [
  { id: 1, title: "دپارتمان پشتیبانی در ۷ روز اخیر بیشترین حجم گفتگو را داشته است.", type: "info", link: "/dashboard/conversations", linkText: "مشاهده گفتگوها" },
  { id: 2, title: "میانگین زمان پاسخ در دپارتمان مالی بالاتر از حد معمول است.", type: "warning", link: "/dashboard/departments/3", linkText: "بررسی دپارتمان" },
  { id: 3, title: "موضوع مشکل پرداخت نسبت به هفته قبل افزایش ۱۵٪ داشته است.", type: "warning", link: "/dashboard/conversations", linkText: "مشاهده گفتگوها" },
  { id: 4, title: "۸ گفتگو بیشتر از ۳۰ دقیقه بدون پاسخ مانده‌اند.", type: "warning", link: "/dashboard/requests?status=waiting", linkText: "مشاهده گفتگوها" },
];