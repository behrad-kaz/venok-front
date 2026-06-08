// components/dashboard/conversations/data.ts
import { Conversation, StatusFilter, StatusBadge } from "./types";

// دپارتمان مدیر دپارتمان (در حالت واقعی از احراز هویت می‌آید)
export const MANAGER_DEPARTMENT = "مالی";
export const MANAGER_NAME = "امیر حسینی";

// کارمندان دپارتمان مالی
export const DEPARTMENT_STAFF = ["امیر حسینی", "سارا رضایی"];

export const getStatusBadge = (status: Conversation["status"]): StatusBadge => {
  switch (status) {
    case "waiting":
      return {
        text: "در انتظار پاسخ",
        color: "bg-[rgba(242,184,75,0.12)] text-[#f2b84b] border-[rgba(242,184,75,0.28)]",
        dotColor: "bg-[#f2b84b]",
      };
    case "answered":
      return {
        text: "پاسخ داده شده",
        color: "bg-[rgba(91,224,168,0.12)] text-[#5be0a8] border-[rgba(91,224,168,0.28)]",
        dotColor: "bg-[#5be0a8]",
      };
    case "open":
      return {
        text: "باز",
        color: "bg-[rgba(89,216,195,0.12)] text-[#59D8C3] border-[rgba(89,216,195,0.3)]",
        dotColor: "bg-[#59D8C3]",
      };
    case "closed":
      return {
        text: "بسته شده",
        color: "bg-[rgba(111,136,128,0.12)] text-gray-400 border-[rgba(111,136,128,0.22)]",
        dotColor: "bg-gray-500",
      };
  }
};

// داده‌های اصلی همه گفتگوها
const allConversationsData: Conversation[] = [
  {
    id: 1,
    customerName: "زهرا احمدی",
    customerInitial: "زا",
    customerPhone: "09121234567",
    subject: "مشکل در پرداخت آنلاین",
    lastMessage: "لطفاً کمکم کنید. پرداختم انجام شده ولی رزرو ثبت نشده",
    time: "۵ دقیقه پیش",
    status: "waiting",
    department: "مالی",
    assignee: "امیر حسینی",
    source: "ویجت سایت",
    startDate: "۱۴۰۲/۱۲/۱۵ - ۱۴:۳۰",
    priority: "urgent",
    unreadCount: 2,
    messages: [
      { id: 1, senderName: "زهرا احمدی", text: "سلام، من یک مشکل با پرداختم دارم", time: "۱۴:۳۰", isSupport: false },
      { id: 2, senderName: "امیر حسینی", text: "سلام، خوش آمدید. چه مشکلی پیش اومده؟", time: "۱۴:۳۱", isSupport: true },
      { id: 3, senderName: "زهرا احمدی", text: "من رزرو پرواز کردم و پرداختم انجام شد ولی هنوز ایمیل تاییدیه دریافت نکردم", time: "۱۴:۳۲", isSupport: false },
      { id: 4, senderName: "امیر حسینی", text: "ممنون از توضیحات. شماره تراکنش یا شماره پیگیری رو دارید؟", time: "۱۴:۳۳", isSupport: true },
      { id: 5, senderName: "زهرا احمدی", text: "لطفاً کمکم کنید. پرداختم انجام شده ولی رزرو ثبت نشده", time: "۱۴:۴۵", isSupport: false },
    ],
  },
  {
    id: 2,
    customerName: "علی محمدی",
    customerInitial: "عم",
    customerPhone: "09132345678",
    subject: "پیگیری وضعیت سفارش",
    lastMessage: "بله، رزروتون تایید شده. کد پیگیری براتون ارسال شد",
    time: "۱۵ دقیقه پیش",
    status: "answered",
    department: "پشتیبانی",
    assignee: "سارا رضایی",
    source: "ویجت سایت",
    startDate: "۱۴۰۲/۱۲/۱۵ - ۱۴:۰۰",
    messages: [],
  },
  {
    id: 3,
    customerName: "مریم کریمی",
    customerInitial: "مک",
    customerPhone: "09153456789",
    subject: "سوال درباره پکیج سفر",
    lastMessage: "سلام، می‌خواستم درباره پکیج کیش سوال بپرسم",
    time: "۲۰ دقیقه پیش",
    status: "open",
    department: "فروش",
    assignee: "",
    source: "ویجت سایت",
    startDate: "۱۴۰۲/۱۲/۱۵ - ۱۳:۵۰",
    unreadCount: 1,
    messages: [],
  },
  {
    id: 4,
    customerName: "حسین رضایی",
    customerInitial: "حر",
    customerPhone: "09174567890",
    subject: "درخواست کنسلی",
    lastMessage: "متشکرم، درخواست کنسلی شما ثبت شد",
    time: "۱ ساعت پیش",
    status: "answered",
    department: "پشتیبانی",
    assignee: "امیر حسینی",
    source: "ایمیل",
    startDate: "۱۴۰۲/۱۲/۱۵ - ۱۳:۰۰",
    messages: [],
  },
  {
    id: 5,
    customerName: "فاطمه نوری",
    customerInitial: "فن",
    customerPhone: "09195678901",
    subject: "تغییر تاریخ پرواز",
    lastMessage: "ممنون از همکاریتون. مشکلم حل شد",
    time: "۳ ساعت پیش",
    status: "closed",
    department: "پشتیبانی",
    assignee: "سارا رضایی",
    source: "ویجت سایت",
    startDate: "۱۴۰۲/۱۲/۱۵ - ۱۱:۰۰",
    messages: [],
  },
];

// کارمندانی که مدیر دپارتمان می‌تواند به آنها ارجاع دهد
export const assignableEmployees = [
  { id: 1, name: "امیر حسینی", department: "مالی", tickets: 5 },
  { id: 2, name: "سارا رضایی", department: "مالی", tickets: 3 },
];

// فیلتر کردن گفتگوها بر اساس دپارتمان مدیر
export const getConversationsByDepartment = (role: string, userDepartment?: string): Conversation[] => {
  if (role === "مدیر کل") {
    return allConversationsData;
  }
  if (role === "مدیر" && userDepartment) {
    return allConversationsData.filter(conv => conv.department === userDepartment);
  }
  if (role === "کارمند") {
    // کارمند فقط تیکت‌های اختصاص یافته به خودش را می‌بیند
    const currentUser = localStorage.getItem("userName") || "امیر حسینی";
    return allConversationsData.filter(conv => conv.assignee === currentUser);
  }
  return allConversationsData;
};

// محاسبه آمار فیلترها بر اساس دپارتمان
export const getStatusFiltersByDepartment = (role: string, userDepartment?: string): StatusFilter[] => {
  const filteredConversations = getConversationsByDepartment(role, userDepartment);
  return [
    { id: "all", label: "همه", count: filteredConversations.length },
    { id: "open", label: "باز", count: filteredConversations.filter(c => c.status === "open").length },
    { id: "waiting", label: "در انتظار پاسخ", count: filteredConversations.filter(c => c.status === "waiting").length },
    { id: "answered", label: "پاسخ داده‌شده", count: filteredConversations.filter(c => c.status === "answered").length },
    { id: "closed", label: "بسته‌شده", count: filteredConversations.filter(c => c.status === "closed").length },
  ];
};