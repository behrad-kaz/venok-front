// components/dashboard/requests/RequestsTable.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, ChevronLeft, ChevronRight, Trash2, CheckCircle } from "lucide-react";

interface Ticket {
  id: string;
  customer: { name: string; phone: string };
  subject: string;
  department: string;
  assignee: string;
  status: string;
  statusText: string;
  date: string;
  lastUpdate: string;
  timestamp: number;
}

interface RequestsTableProps {
  selectedRole?: string;
  searchQuery: string;
  statusFilter: string;
  timeRangeFilter: string;
  departmentFilter: string;
  onTicketsChange?: (counts: {
    all: number;
    unanswered: number;
    pending: number;
    answered: number;
    closed: number;
  }) => void;
}

const maskPhoneNumber = (phone: string): string => {
  if (!phone || phone.length < 11) return phone;
  return phone.slice(0, 4) + "***" + phone.slice(-4);
};

const getDateTimestamp = (dateString: string): number => {
  const parts = dateString.split("/");
  if (parts.length === 3) {
    return new Date(2024, parseInt(parts[1]) - 1, parseInt(parts[2])).getTime();
  }
  return Date.now();
};

const isWithinTimeRange = (ticketDate: string, range: string): boolean => {
  const now = Date.now();
  const ticketTime = getDateTimestamp(ticketDate);
  const diffMs = now - ticketTime;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  switch (range) {
    case "today":
      return diffDays < 1;
    case "yesterday":
      return diffDays >= 1 && diffDays < 2;
    case "last3days":
      return diffDays <= 3;
    case "last7days":
      return diffDays <= 7;
    case "lastMonth":
      return diffDays <= 30;
    default:
      return true;
  }
};

const getManagerDepartment = (): string => {
  return "حسابداری";
};

// نام کارمند جاری (در حالت واقعی از احراز هویت می‌آید)
const getCurrentEmployee = (): string => {
  return "امیر حسینی";
};

const generateTickets = (role?: string): Ticket[] => {
  const customers = [
    { name: "احمد رضایی", phone: "09123456789" },
    { name: "سارا محمدی", phone: "09123456788" },
    { name: "کامران کریمی", phone: "09123456787" },
    { name: "الهام بوسفی", phone: "09123456786" },
    { name: "رضا نادری", phone: "09123456785" },
    { name: "مریم رضایی", phone: "09123456784" },
    { name: "علی کریمی", phone: "09123456783" },
    { name: "نیلوفر کریمی", phone: "09123456782" },
    { name: "امیر حسینی", phone: "09123456781" },
    { name: "زهرا محمدی", phone: "09123456780" },
  ];

  const subjects = [
    "مشکل در پرداخت", "پیگیری رزرو سفر داخلی", "پیگیری تاریخ پرواز خارجی",
    "مشکل در صدور بلیط", "مشکل فنی در سایت", "درخواست مشاوره", "لغو سفر",
    "تغییر تاریخ پرواز", "مشکل در ورود به حساب", "درخواست فاکتور",
  ];

  const departments = ["حسابداری", "سفرهای داخلی", "سفرهای خارجی", "پشتیبانی فنی"];
  const assignees = ["مریم رضایی", "علی کریمی", "نیلوفر کریمی", "امیر حسینی", "سارا محمدی"];
  const statuses = [
    { status: "pending", text: "در حال پیگیری" },
    { status: "unanswered", text: "پاسخ داده نشده" },
    { status: "answered", text: "پاسخ داده شده" },
    { status: "closed", text: "بسته شده" },
  ];

  const tickets: Ticket[] = [];
  const managerDepartment = role === "مدیر" ? getManagerDepartment() : null;
  const currentEmployee = role === "کارمند" ? getCurrentEmployee() : null;
  
  let deptStatusCounter: Record<string, number> = {
    "حسابداری": 0,
    "سفرهای داخلی": 0,
    "سفرهای خارجی": 0,
    "پشتیبانی فنی": 0,
  };
  
  for (let i = 1; i <= 50; i++) {
    const department = departments[i % departments.length];
    const assignee = assignees[i % assignees.length];
    
    // فیلتر بر اساس نقش
    if (role === "مدیر" && department !== managerDepartment) {
      continue;
    }
    if (role === "کارمند" && assignee !== currentEmployee) {
      continue;
    }
    
    const customer = customers[i % customers.length];
    const subject = subjects[i % subjects.length];
    const statusIndex = deptStatusCounter[department] % statuses.length;
    const statusObj = statuses[statusIndex];
    
    deptStatusCounter[department]++;

    const day = i % 30;
    const month = 12 - Math.floor(i / 10);
    const minutesAgo = [5, 10, 15, 30, 45, 60, 120, 180, 240, 360];
    const lastUpdateMinute = minutesAgo[i % minutesAgo.length];

    tickets.push({
      id: `SPI-${1040 + i}`,
      customer: { name: customer.name, phone: customer.phone },
      subject: subject,
      department: department,
      assignee: assignee,
      status: statusObj.status,
      statusText: statusObj.text,
      date: `۱۴۰۳/${month}/${day + 1}`,
      lastUpdate: lastUpdateMinute >= 60 
        ? `${Math.floor(lastUpdateMinute / 60)} ساعت پیش` 
        : `${lastUpdateMinute} دقیقه پیش`,
      timestamp: getDateTimestamp(`۱۴۰۳/${month}/${day + 1}`),
    });
  }
  
  return tickets;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "unanswered":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "answered":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "closed":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return "🕒";
    case "unanswered":
      return "⚠️";
    case "answered":
      return "✓";
    case "closed":
      return "✗";
    default:
      return "•";
  }
};

export default function RequestsTable({
  selectedRole,
  searchQuery,
  statusFilter,
  timeRangeFilter,
  departmentFilter,
  onTicketsChange,
}: RequestsTableProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [deleteMessage, setDeleteMessage] = useState<{ show: boolean; id: string }>({ show: false, id: "" });

  useEffect(() => {
    const generatedTickets = generateTickets(selectedRole);
    setTickets(generatedTickets);
  }, [selectedRole]);

  const filterBaseTickets = useCallback(() => {
    let filtered = [...tickets];

    if (searchQuery) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.customer.name.includes(searchQuery) ||
          ticket.customer.phone.includes(searchQuery) ||
          ticket.subject.includes(searchQuery)
      );
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.department === departmentFilter);
    }

    if (timeRangeFilter !== "all") {
      filtered = filtered.filter((ticket) => isWithinTimeRange(ticket.date, timeRangeFilter));
    }

    return filtered;
  }, [tickets, searchQuery, departmentFilter, timeRangeFilter]);

  const applyStatusFilter = useCallback((baseFiltered: Ticket[]) => {
    if (statusFilter !== "all") {
      return baseFiltered.filter((ticket) => ticket.status === statusFilter);
    }
    return baseFiltered;
  }, [statusFilter]);

  const calculateStats = useCallback((baseFiltered: Ticket[]) => {
    return {
      all: baseFiltered.length,
      unanswered: baseFiltered.filter(t => t.status === "unanswered").length,
      pending: baseFiltered.filter(t => t.status === "pending").length,
      answered: baseFiltered.filter(t => t.status === "answered").length,
      closed: baseFiltered.filter(t => t.status === "closed").length,
    };
  }, []);

  useEffect(() => {
    const baseFiltered = filterBaseTickets();
    const stats = calculateStats(baseFiltered);
    if (onTicketsChange) {
      onTicketsChange(stats);
    }
    const statusFiltered = applyStatusFilter(baseFiltered);
    setFilteredTickets(statusFiltered);
    setCurrentPage(1);
  }, [filterBaseTickets, applyStatusFilter, calculateStats, onTicketsChange]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTickets = filteredTickets.slice(startIndex, endIndex);

  const handleSelectAll = () => {
    if (selectedTickets.length === currentTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(currentTickets.map((t) => t.id));
    }
  };

  const handleSelectTicket = (id: string) => {
    if (selectedTickets.includes(id)) {
      setSelectedTickets(selectedTickets.filter((t) => t !== id));
    } else {
      setSelectedTickets([...selectedTickets, id]);
    }
  };

  const handleDeleteTicket = (id: string) => {
    setTickets((prevTickets) => prevTickets.filter((t) => t.id !== id));
    setSelectedTickets((prev) => prev.filter((t) => t !== id));
    setDeleteMessage({ show: true, id });
    setTimeout(() => {
      setDeleteMessage({ show: false, id: "" });
    }, 1500);
  };

  const handleBulkDelete = () => {
    setTickets((prevTickets) => prevTickets.filter((t) => !selectedTickets.includes(t.id)));
    setSelectedTickets([]);
    setDeleteMessage({ show: true, id: `${selectedTickets.length} تیکت` });
    setTimeout(() => {
      setDeleteMessage({ show: false, id: "" });
    }, 1500);
  };

  const handleChat = (ticketId: string) => {
    console.log("گفتگو با تیکت:", ticketId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[#0D1B17] border border-[#59D8C3]/20 rounded-xl overflow-hidden"
    >
      {selectedTickets.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-[#12251F] border-b border-[#59D8C3]/20">
          <span className="text-white text-sm">{selectedTickets.length} تیکت انتخاب شده</span>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف انتخاب‌ها</span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {deleteMessage.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap"
          >
            <CheckCircle className="w-4 h-4 inline ml-2" />
            تیکت {deleteMessage.id} با موفقیت حذف شد
          </motion.div>
        )}
      </AnimatePresence>

      {/* جدول - نسخه دسکتاپ */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#12251F] border-b border-[#59D8C3]/20">
            <tr>
              <th className="px-4 py-3 text-right">
                <input
                  type="checkbox"
                  checked={selectedTickets.length === currentTickets.length && currentTickets.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-[#59D8C3]/30 bg-[#0D1B17] text-[#59D8C3] focus:ring-[#59D8C3]"
                />
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">شماره تیکت</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">مشتری</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">موضوع</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">دپارتمان</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">مسئول</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">وضعیت</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">تاریخ</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">گفتگو</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#59D8C3]/10">
            {currentTickets.map((ticket, index) => (
              <motion.tr
                key={ticket.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="hover:bg-[#12251F] transition-colors"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedTickets.includes(ticket.id)}
                    onChange={() => handleSelectTicket(ticket.id)}
                    className="w-4 h-4 rounded border-[#59D8C3]/30 bg-[#0D1B17] text-[#59D8C3] focus:ring-[#59D8C3]"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="text-[#59D8C3] text-sm font-mono">{ticket.id}</span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-medium">{ticket.customer.name}</p>
                    <p className="text-gray-500 text-xs">{maskPhoneNumber(ticket.customer.phone)}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-white text-sm">{ticket.subject}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-300 text-sm">{ticket.department}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm">{ticket.assignee}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col items-start gap-1">
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(ticket.status)}`}
                    >
                      {getStatusIcon(ticket.status)} {ticket.statusText}
                    </span>
                    <span className="text-gray-500 text-xs">{ticket.lastUpdate}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-white text-sm">{ticket.date}</p>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleChat(ticket.id)}
                    className="p-2 w-20 text-[0.5rem] bg-[#59D8C3]/10 hover:bg-[#59D8C3]/20 rounded-3xl"
                  >
                    <span>مشاهده گفتگو</span>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDeleteTicket(ticket.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* نمای کارتی - نسخه موبایل */}
      <div className="lg:hidden p-4 space-y-4">
        {currentTickets.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            className="bg-[#12251F] rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[#59D8C3] text-sm font-mono">{ticket.id}</span>
              <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(ticket.status)}`}>
                {getStatusIcon(ticket.status)} {ticket.statusText}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">{ticket.customer.name}</p>
              <p className="text-gray-500 text-xs">{maskPhoneNumber(ticket.customer.phone)}</p>
            </div>
            <p className="text-white text-sm">{ticket.subject}</p>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">{ticket.department}</span>
              <span className="text-gray-500 text-xs">{ticket.date}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#59D8C3]/10">
              <div className="flex items-center gap-2">
                <button onClick={() => handleChat(ticket.id)} className="p-2 bg-[#59D8C3]/10 rounded-lg">
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteTicket(ticket.id)} className="p-2 bg-red-500/10 rounded-lg">
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>
              <span className="text-gray-500 text-xs">{ticket.lastUpdate}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#59D8C3]/20">
          <div className="text-sm text-gray-400">
            نمایش {startIndex + 1} تا {Math.min(endIndex, filteredTickets.length)} از {filteredTickets.length} تیکت
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-[#12251F] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-white text-sm">
              صفحه {currentPage} از {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-[#12251F] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">هیچ تیکتی با این فیلترها یافت نشد</p>
        </div>
      )}
    </motion.div>
  );
}