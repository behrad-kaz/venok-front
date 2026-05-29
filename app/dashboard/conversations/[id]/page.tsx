// app/dashboard/conversations/[id]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  X,
  UserPlus,
  Paperclip,
  Image,
  File,
  Mic,
  Smile,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface Message {
  id: number;
  text: string;
  time: string;
  isSupport: boolean;
  senderName: string;
}

interface Ticket {
  id: string;
  ticketId: string;
  customerName: string;
  customerPhone: string;
  subject: string;
  department: string;
  assignee: string;
  assigneeName: string;
  status: "active" | "unassigned" | "closed";
  ticketStatus: "unanswered" | "pending" | "answered" | "closed";
  statusText: string;
  date: string;
  lastUpdate: string;
  source: string;
  messages: Message[];
}

const ticketData: Ticket = {
  id: "1",
  ticketId: "SUP-1042",
  customerName: "رضا احمدی",
  customerPhone: "09123456789",
  subject: "مشکل در پرداخت",
  department: "حسابداری",
  assignee: "امیر حسینی",
  assigneeName: "امیر حسینی",
  status: "active",
  ticketStatus: "pending",
  statusText: "در حال پیگیری",
  date: "امروز ۱۴:۳۰",
  lastUpdate: "۱۵ دقیقه پیش",
  source: "ویجت سایت",
  messages: [
    { id: 1, text: "سلام، پرداخت انجام شده ولی سفارش ثبت نشده.", time: "۱۴:۳۲", isSupport: false, senderName: "رضا احمدی" },
    { id: 2, text: "سلام، لطفا شماره پیگیری پرداخت را ارسال کنید.", time: "۱۴:۳۵", isSupport: true, senderName: "پشتیبانی" },
    { id: 3, text: "شماره پیگیری ۸۴۵۲۳۱ است.", time: "۱۴:۳۷", isSupport: false, senderName: "رضا احمدی" },
    { id: 4, text: "ممنون، در حال بررسی هستم.", time: "۱۴:۳۸", isSupport: true, senderName: "پشتیبانی" },
  ],
};

const pageStatusButtons = [
  { id: "active", label: "فعال" },
  { id: "unassigned", label: "بی‌مسئول" },
  { id: "closed", label: "بسته" },
];

const ticketStatusOptions = [
  { id: "unanswered", label: "پاسخ داده نشده", icon: AlertCircle },
  { id: "pending", label: "در حال پیگیری", icon: Clock },
  { id: "answered", label: "پاسخ داده شده", icon: CheckCircle },
  { id: "closed", label: "بسته شده", icon: XCircle },
];

const employees = [
  { id: 1, name: "سارا محمدی", department: "حسابداری", tickets: 4 },
  { id: 2, name: "علی احمدی", department: "سفرهای داخلی", tickets: 6 },
  { id: 3, name: "نیلوفر کریمی", department: "سفرهای خارجی", tickets: 3 },
  { id: 4, name: "امیر حسینی", department: "حسابداری", tickets: 5 },
  { id: 5, name: "الهام کاظمی", department: "سفرهای داخلی", tickets: 3 },
  { id: 6, name: "رضا نادری", department: "پشتیبانی فنی", tickets: 2 },
];

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [selectedPageStatus, setSelectedPageStatus] = useState<string>("active");
  const [selectedTicketStatus, setSelectedTicketStatus] = useState<string>("pending");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [note, setNote] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTicket(ticketData);
    setSelectedPageStatus(ticketData.status);
    setSelectedTicketStatus(ticketData.ticketStatus);
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !ticket) return;
    console.log("ارسال پیام:", newMessage);
    setNewMessage("");
  };

  const handlePageStatusChange = (status: string) => {
    setSelectedPageStatus(status);
    if (ticket) {
      if (status === "active") {
        setTicket({ ...ticket, status: "active" });
      } else if (status === "unassigned") {
        setTicket({ ...ticket, status: "unassigned", assignee: "", assigneeName: "" });
      } else if (status === "closed") {
        setTicket({ ...ticket, status: "closed", ticketStatus: "closed", statusText: "بسته شده" });
        setSelectedTicketStatus("closed");
      }
    }
  };

  const handleTicketStatusChange = (status: string) => {
    setSelectedTicketStatus(status);
    if (ticket) {
      let statusText = "";
      if (status === "unanswered") statusText = "پاسخ داده نشده";
      if (status === "pending") statusText = "در حال پیگیری";
      if (status === "answered") statusText = "پاسخ داده شده";
      if (status === "closed") statusText = "بسته شده";
      setTicket({ ...ticket, ticketStatus: status as any, statusText });
    }
  };

  const handleAssign = () => {
    if (!selectedEmployee) return;
    const employee = employees.find(e => e.name === selectedEmployee);
    if (employee && ticket) {
      setTicket({
        ...ticket,
        assignee: employee.name,
        assigneeName: employee.name,
        status: "active",
      });
      setSelectedPageStatus("active");
    }
    setIsAssignModalOpen(false);
    setSelectedEmployee("");
    setNote("");
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log("فایل‌های انتخاب شده:", files);
    }
  };

  if (!ticket) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">تیکت مورد نظر یافت نشد</p>
            <Link href="/dashboard/conversations" className="text-[#59D8C3] hover:underline mt-4 inline-block">
              بازگشت به لیست گفتگوها
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isClosed = selectedPageStatus === "closed";

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* هدر صفحه */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#12251F] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-white">#{ticket.ticketId}</h2>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs ${
                    selectedTicketStatus === "pending"
                      ? "bg-[#59D8C3]/10 text-[#59D8C3] border-[#59D8C3]/30"
                      : selectedTicketStatus === "unanswered"
                      ? "bg-red-500/10 text-red-400 border-red-500/30"
                      : selectedTicketStatus === "answered"
                      ? "bg-green-500/10 text-green-400 border-green-500/30"
                      : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {selectedTicketStatus === "pending" ? "در حال پیگیری" : 
                   selectedTicketStatus === "unanswered" ? "پاسخ داده نشده" :
                   selectedTicketStatus === "answered" ? "پاسخ داده شده" : "بسته شده"}
                </span>
                {selectedPageStatus === "unassigned" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    اختصاص داده نشده
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pageStatusButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => handlePageStatusChange(btn.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedPageStatus === btn.id
                    ? "bg-[#59D8C3]/10 border-[#59D8C3]/30 text-[#59D8C3]"
                    : "border-[#59D8C3]/20 text-gray-400 hover:border-[#59D8C3]/40 hover:text-white"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* محتوای اصلی سه ستونه */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4">
          {/* ستون راست - اطلاعات تیکت */}
          <div className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-4 flex flex-col gap-4">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">اطلاعات تیکت</p>
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-[11px] text-gray-500">شماره تیکت:</span>
                  <span className="text-[11px] font-medium text-[#59D8C3]">#{ticket.ticketId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-gray-500">نام مشتری:</span>
                  <span className="text-[11px] font-medium text-white">{ticket.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-gray-500">موبایل:</span>
                  <span className="text-[11px] font-medium text-white">{ticket.customerPhone.slice(0, 4)}***{ticket.customerPhone.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-gray-500">موضوع:</span>
                  <span className="text-[11px] font-medium text-white">{ticket.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-gray-500">دپارتمان:</span>
                  <span className="text-[11px] font-medium text-white">{ticket.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-gray-500">منبع:</span>
                  <span className="text-[11px] font-medium text-white">{ticket.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-gray-500">ثبت شده:</span>
                  <span className="text-[11px] font-medium text-white">{ticket.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-gray-500">آخرین بروزرسانی:</span>
                  <span className="text-[11px] font-medium text-white">{ticket.lastUpdate}</span>
                </div>
              </div>
            </div>

            {/* تغییر وضعیت تیکت - در حالت بسته نمایش داده نشود */}
            {!isClosed && (
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">تغییر وضعیت</p>
                <div className="space-y-1.5">
                  {ticketStatusOptions.map((status) => (
                    <button
                      key={status.id}
                      onClick={() => handleTicketStatusChange(status.id)}
                      className={`w-full text-right px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                        selectedTicketStatus === status.id
                          ? "bg-[#59D8C3]/10 border-[#59D8C3]/30 text-[#59D8C3]"
                          : "border-[#59D8C3]/20 text-gray-400 hover:border-[#59D8C3]/40 hover:text-white"
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ستون وسط - گفتگو */}
          <div className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-[#59D8C3]/20 flex items-center justify-between">
              <p className="text-xs font-semibold text-white">گفتگو با مشتری</p>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border border-[#59D8C3]/20 text-gray-400 hover:border-[#59D8C3]/40 hover:text-white transition-all">
                <Edit className="w-3 h-3" />
                یادداشت داخلی
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[400px]">
              {/* پیام سیستم - ارجاع به دپارتمان */}
              <div className="flex justify-center my-3">
                <span className="px-3 py-1.5 rounded-full text-[11px] border border-[#59D8C3]/20 text-gray-500 bg-[rgba(255,255,255,0.02)]">
                  تیکت به دپارتمان {ticket.department} ارجاع شد.
                </span>
              </div>

              {/* پیام‌ها */}
              {!isClosed && ticket.messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.isSupport ? "flex-row" : "flex-row-reverse"}`}>
                  <div className="relative flex-shrink-0">
                    <div className="w-7 h-7 rounded-xl bg-[#59D8C3]/10 border border-[#59D8C3]/20 flex items-center justify-center">
                      <span className="text-[#59D8C3] text-[10px] font-bold">
                        {msg.isSupport ? "پش" : msg.senderName.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      msg.isSupport
                        ? "bg-[#59D8C3]/10 border border-[#59D8C3]/20 rounded-tr-sm"
                        : "bg-[#12251F] border border-[#59D8C3]/20 rounded-tl-sm"
                    }`}
                  >
                    <p className={`text-[10px] font-semibold mb-1 ${msg.isSupport ? "text-[#59D8C3]" : "text-gray-500"}`}>
                      {msg.isSupport ? "پشتیبانی" : msg.senderName}
                    </p>
                    <p className="text-sm leading-relaxed text-white">{msg.text}</p>
                    <p className="text-[10px] text-gray-500 mt-1 text-left">{msg.time}</p>
                  </div>
                </div>
              ))}

              {/* پیام سیستم - اختصاص تیکت */}
              {selectedPageStatus !== "unassigned" && ticket.assignee && (
                <div className="flex justify-center my-3">
                  <span className="px-3 py-1.5 rounded-full text-[11px] border border-[#59D8C3]/20 text-gray-500 bg-[rgba(255,255,255,0.02)]">
                    تیکت به {ticket.assignee} اختصاص داده شد.
                  </span>
                </div>
              )}

              {/* پیام بسته شدن تیکت */}
              {isClosed && (
                <div className="flex justify-center mt-4">
                  <span className="px-4 py-2 rounded-full text-xs text-gray-500 bg-[rgba(111,136,128,0.1)] border border-[rgba(111,136,128,0.2)]">
                    تیکت بسته شده است
                  </span>
                </div>
              )}
            </div>

            {/* ورودی پیام - فقط در حالت بسته نمایش داده نشود */}
            {!isClosed && (
              <div className="px-4 pb-4 pt-2 border-t border-[#59D8C3]/20">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleFileUpload}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#12251F] transition-colors"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#12251F] transition-colors">
                      <Image className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#12251F] transition-colors">
                      <Mic className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#12251F] transition-colors"
                      >
                        <Smile className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="پاسخ خود را بنویسید..."
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-all"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <Send className="w-4 h-4" />
                    <span className="text-xs hidden sm:inline">ارسال</span>
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
              </div>
            )}
          </div>

          {/* ستون چپ - اطلاعات مسئول و تاریخچه */}
          <div className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-4 flex flex-col gap-4">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">مسئول تیکت</p>
              {selectedPageStatus === "unassigned" ? (
                <div className="flex flex-col gap-3 p-3 rounded-xl bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                  <div className="items-center justify-between">
                    <span className="text-xs text-gray-400">هنوز اختصاص داده نشده</span>
                    <button
                      onClick={() => setIsAssignModalOpen(true)}
                      className="flex items-center gap-1 text-[10px] text-[#59D8C3] hover:text-[#5BE0A8] transition-colors"
                    >
                      ارجاع به کارمند
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)]">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-[#59D8C3]/10 border border-[#59D8C3]/20 flex items-center justify-center">
                      <span className="text-[#59D8C3] text-xs font-bold">{ticket.assignee?.charAt(0)}</span>
                    </div>
                    <span className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full border-2 border-[#0D1B17] bg-[#5BE0A8]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-white">{ticket.assignee}</p>
                    <p className="text-[10px] text-gray-500">کارمند پشتیبانی</p>
                  </div>
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="text-[10px] text-[#59D8C3] hover:text-[#5BE0A8] transition-colors"
                  >
                    تغییر
                  </button>
                </div>
              )}
            </div>

            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">مدیر دپارتمان</p>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[rgba(255,255,255,0.02)]">
                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 rounded-xl bg-[#59D8C3]/10 border border-[#59D8C3]/20 flex items-center justify-center">
                    <span className="text-[#59D8C3] text-[10px] font-bold">سم</span>
                  </div>
                  <span className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full border-2 border-[#0D1B17] bg-[#5BE0A8]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-white">سارا محمدی</p>
                  <p className="text-[10px] text-gray-500">حسابداری</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">تاریخچه ارجاع</p>
              <div className="space-y-2.5">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#59D8C3]" />
                    <div className="w-px flex-1 bg-[#59D8C3]/20 mt-1 h-8" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-white">امیر حسینی</p>
                    <p className="text-xs text-gray-500 mt-0.5">اختصاص داده شد</p>
                    <p className="text-xs text-gray-500/70 mt-1">امروز ۱۴:۳۳</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#5BE0A8]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">سارا محمدی</p>
                    <p className="text-xs text-gray-500 mt-0.5">ارجاع اولیه</p>
                    <p className="text-xs text-gray-500/70 mt-1">امروز ۱۴:۳۰</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">فعالیت‌ها</p>
              <div className="space-y-2.5">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#59D8C3]" />
                    <div className="w-px flex-1 bg-[#59D8C3]/20 mt-1 h-8" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-white">وضعیت به «در حال پیگیری» تغییر کرد</p>
                    <p className="text-xs text-gray-500/70 mt-1">۱۵ دقیقه پیش</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">تیکت ایجاد شد</p>
                    <p className="text-xs text-gray-500/70 mt-1">امروز ۱۴:۳۰</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* مودال ارجاع به کارمند */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssignModalOpen(false)}
              className="fixed inset-0 bg-black/70 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
            >
              <div className="bg-[#0D1B17] border border-[#59D8C3]/20 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-white">ارجاع تیکت</h3>
                  <button
                    onClick={() => setIsAssignModalOpen(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#12251F] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-white">انتخاب کارمند</label>
                    <select
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white focus:outline-none focus:border-[#59D8C3] transition-all cursor-pointer"
                    >
                      <option value="">انتخاب کارمند...</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.name}>
                          {emp.name} — {emp.department} ({emp.tickets} تیکت)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-white">توضیح برای همکار (اختیاری)</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="توضیح یا نکته‌ای که باید بداند..."
                      rows={3}
                      className="w-full rounded-xl px-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white placeholder:text-gray-500 resize-none focus:outline-none focus:border-[#59D8C3] transition-all"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleAssign}
                      disabled={!selectedEmployee}
                      className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ارجاع
                    </button>
                    <button
                      onClick={() => setIsAssignModalOpen(false)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#12251F] border border-[#59D8C3]/20 text-gray-300 hover:border-[#59D8C3]/40 hover:text-white transition-all"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}