'use client';

import { useState, useEffect, useRef } from "react";
import {
  Send,
  ChevronRight,
  Loader2,
  User,
  CheckCircle,
  Clock,
  MessageCircle,
  Paperclip,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Conversation } from "./types";
import { getStatusBadge } from "./data";
import { UserRole } from "@/stores/useRoleStore";
import { useModal } from "@/components/ui/modal";
import { authService } from "@/services/auth.service";
import { api } from "@/services/api-client";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ✅ تعریف تابع cn در این فایل
const cn = (...inputs: any[]) => twMerge(clsx(inputs));

interface AssignableEmployee {
  id: number;
  name: string;
  department: string;
  tickets: number;
  departmentId?: number;
  role?: string;
}

interface ConversationChatProps {
  conversation: Conversation;
  newMessage: string;
  showDetails: boolean;
  onNewMessageChange: (message: string) => void;
  onSendMessage: (message: string) => void;
  onToggleDetails: () => void;
  onBack: () => void;
  isMobile: boolean;
  isTablet?: boolean;
  role: UserRole;
  assignableEmployees?: AssignableEmployee[];
  onAssignConversation?: (staffId: number) => void;
  onStatusChange?: (status: string) => void;
  onCloseConversation?: () => void;
  socketRef?: any;
  isAdmin?: boolean;
  isManager?: boolean;
  departmentName?: string;
}

export default function ConversationChat({
  conversation,
  newMessage,
  showDetails,
  onNewMessageChange,
  onSendMessage,
  onToggleDetails,
  onBack,
  isMobile,
  isTablet = false,
  role,
  assignableEmployees = [],
  onAssignConversation,
  onStatusChange,
  onCloseConversation,
  socketRef,
  isAdmin = false,
  isManager = false,
  departmentName = "",
}: ConversationChatProps) {
  const { showSuccess, showError, showConfirm } = useModal();
  const badge = getStatusBadge(conversation.status);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showBackButton = isMobile || isTablet;

  const currentStaffId = useRef<number | null>(null);
  const currentUserName = useRef<string | null>(null);

  useEffect(() => {
    currentStaffId.current = authService.getStaffId();
    currentUserName.current = authService.getStoredUserData()?.userName || null;
  }, [conversation.assigneeId]);

  // ✅ تنظیم ارتفاع خودکار textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const maxHeight = 160;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = newHeight + "px";

    if (textarea.scrollHeight > maxHeight) {
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.overflowY = "hidden";
    }
  }, [newMessage]);

  // اسکرول به پایین
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);

  // بستن dropdown با کلیک خارج
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowAssignDropdown(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ تابع فیلتر کردن کارمندان برای دراپ‌دان
  const getFilteredEmployeesForDropdown = () => {
    const employees = Array.isArray(assignableEmployees)
      ? assignableEmployees
      : [];

    // ✅ اگر مدیر کل است، همه کارمندان را نمایش بده
    if (isAdmin) {
      console.log("👑 [Chat] مدیر کل: نمایش همه کارمندان برای تخصیص");
      return employees;
    }

    // ✅ اگر مدیر دپارتمان است، فقط کارمندان دپارتمان خودش را نمایش بده
    if (isManager) {
      const filtered = employees.filter((emp) => {
        // اگر کارمند دپارتمان ندارد، به مدیر دپارتمان نشان بده
        if (!emp.department || emp.department === "بدون دپارتمان") {
          return true;
        }
        // اگر دپارتمان کارمند با دپارتمان مدیر مطابقت دارد
        return emp.department === departmentName;
      });
      console.log(
        `👔 [Chat] مدیر دپارتمان: ${filtered.length} کارمند قابل تخصیص (از ${employees.length} کل)`,
      );
      return filtered;
    }

    return [];
  };

  // ✅ لیست فیلتر شده برای دراپ‌دان
  const filteredEmployees = getFilteredEmployeesForDropdown();

  // ✅ آپلود فایل
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const isImage = file.type.startsWith("image/");
    const folder = isImage ? "chat-images" : "chat-files";
    formData.append("folder", folder);

    try {
      const response = await api.post<{ filePath: string }>(
        "/upload/file",
        formData,
      );
      return response.filePath;
    } catch (error) {
      console.error("❌ خطا در آپلود فایل:", error);
      throw new Error("خطا در آپلود فایل");
    }
  };

  // ✅ ارسال پیام با فایل (ترکیب متن کاربر و فایل)
  const handleSendWithFile = async () => {
    if (!selectedFile || isSending || isUploading) return;

    setIsUploading(true);
    setIsSending(true);

    try {
      // 1. آپلود فایل
      const filePath = await uploadFile(selectedFile);

      // 2. ساخت محتوای فایل
      const isImage = selectedFile.type.startsWith("image/");
      let fileContent = "";

      if (isImage) {
        fileContent = `![${selectedFile.name}](${filePath})`;
      } else {
        const fileName = selectedFile.name;
        const fileSize = (selectedFile.size / 1024).toFixed(1);
        fileContent = `📎 **${fileName}** (${fileSize} KB)\n${filePath}`;
      }

      // ✅ 3. ترکیب متن کاربر و محتوای فایل
      const userText = newMessage.trim();
      let messageText = "";

      if (userText) {
        messageText = `${userText}\n\n${fileContent}`;
      } else {
        messageText = fileContent;
      }

      // 4. ارسال پیام از طریق Socket
      if (socketRef?.current?.connected) {
        socketRef.current.emit("send_message", {
          conversationId: String(conversation.id),
          text: messageText,
          isInternal: false,
        });
      }

      await onSendMessage(messageText);

      // 5. پاک کردن فایل انتخاب شده و پیام
      setSelectedFile(null);
      setFilePreview(null);
      onNewMessageChange("");

      showSuccess("فایل با موفقیت ارسال شد");
    } catch (error) {
      console.error("❌ خطا در ارسال فایل:", error);
      showError("خطا در ارسال فایل");
    } finally {
      setIsUploading(false);
      setIsSending(false);
    }
  };

  // ✅ ارسال پیام متنی
  const handleSend = async () => {
    // اگر فایل انتخاب شده باشد، از متد ارسال با فایل استفاده کن
    if (selectedFile) {
      await handleSendWithFile();
      return;
    }

    const messageToSend = newMessage.trim();
    if (!messageToSend || isSending) return;

    setIsSending(true);

    try {
      if (socketRef?.current?.connected) {
        socketRef.current.emit("send_message", {
          conversationId: String(conversation.id),
          text: messageToSend,
          isInternal: false,
        });
      }

      await onSendMessage(messageToSend);
      onNewMessageChange("");
    } catch (error) {
      console.error("❌ خطا در ارسال پیام:", error);
      showError("خطا در ارسال پیام");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ✅ انتخاب فایل
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // محدودیت حجم: 10MB
    if (file.size > 10 * 1024 * 1024) {
      showError("حجم فایل نباید بیشتر از ۱۰ مگابایت باشد");
      return;
    }

    setSelectedFile(file);

    // اگر عکس است، پیش‌نمایش ایجاد کن
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    // ریست کردن input
    e.target.value = "";
  };

  // ✅ حذف فایل انتخاب شده
  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleAssign = (staffId: number) => {
    if (onAssignConversation) {
      onAssignConversation(staffId);
      setShowAssignDropdown(false);
      showSuccess("گفتگو با موفقیت تخصیص داده شد");
    }
  };

  const handleStatusChange = (status: string) => {
    if (onStatusChange) {
      onStatusChange(status);
      setShowStatusDropdown(false);

      const statusLabels: Record<string, string> = {
        open: "باز",
        waiting: "در انتظار پاسخ",
        answered: "پاسخ داده شده",
        closed: "بسته شده",
      };
      showSuccess(
        `وضعیت گفتگو به "${statusLabels[status] || status}" تغییر یافت`,
      );
    }
  };

  const handleClose = () => {
    showConfirm(
      `آیا از بستن گفتگو با "${conversation.customerName}" مطمئن هستید؟`,
      "تایید بستن گفتگو",
      () => {
        if (onCloseConversation) {
          onCloseConversation();
          showSuccess(`گفتگو با ${conversation.customerName} بسته شد`);
        }
      },
    );
  };

  const statusOptions = [
    { id: "open", label: "باز", icon: Clock },
    { id: "waiting", label: "در انتظار پاسخ", icon: Clock },
    { id: "answered", label: "پاسخ داده شده", icon: CheckCircle },
    { id: "closed", label: "بسته شده", icon: CheckCircle },
  ];

  const isMessageFromSupport = (msg: any): boolean => {
    if (msg.senderType) {
      if (
        msg.senderType === "agent" ||
        msg.senderType === "admin" ||
        msg.senderType === "support"
      ) {
        return true;
      }
      if (msg.senderType === "customer") {
        return false;
      }
    }

    if (msg.isSupport !== undefined) {
      return msg.isSupport === true;
    }

    if (msg.senderId && conversation.assigneeId) {
      if (msg.senderId === conversation.assigneeId) {
        return true;
      }
    }

    if (msg.senderId && currentStaffId.current) {
      if (msg.senderId === currentStaffId.current) {
        return true;
      }
    }

    if (msg.senderName && currentUserName.current) {
      if (msg.senderName === currentUserName.current) {
        return true;
      }
    }
    return false;
  };

  // ✅ نمایش فایل در پیام (با پشتیبانی از فرمت‌های مختلف)
  const renderMessageContent = (text: string) => {
    // بررسی وجود تصویر با فرمت ![name](url)
    const imageMatch = text.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (imageMatch) {
      const [, alt, url] = imageMatch;
      return (
        <div className="space-y-2">
          <img
            src={url}
            alt={alt}
            className="max-w-[300px] max-h-[300px] rounded-lg object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          {text.replace(imageMatch[0], "").trim() && (
            <p className="whitespace-pre-wrap">
              {text.replace(imageMatch[0], "").trim()}
            </p>
          )}
        </div>
      );
    }

    // بررسی وجود فایل با فرمت 📎 **name** (size)\nurl
    const fileMatch = text.match(/📎 \*\*([^*]+)\*\* \(([^)]+)\)\n([^\n]+)/);
    if (fileMatch) {
      const [, fileName, fileSize, fileUrl] = fileMatch;
      return (
        <div className="space-y-2">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:border-[#59D8C3] transition-colors text-[#59D8C3]"
          >
            📎 {fileName} ({fileSize} KB)
          </a>
          {text.replace(fileMatch[0], "").trim() && (
            <p className="whitespace-pre-wrap">
              {text.replace(fileMatch[0], "").trim()}
            </p>
          )}
        </div>
      );
    }

    // بررسی وجود فایل با فرمت 📎 name\nurl
    const oldFileMatch = text.match(/📎 ([^\n]+)\n([^\n]+)/);
    if (oldFileMatch) {
      const [, fileName, fileUrl] = oldFileMatch;
      return (
        <div className="space-y-2">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:border-[#59D8C3] transition-colors text-[#59D8C3]"
          >
            📎 {fileName}
          </a>
          {text.replace(oldFileMatch[0], "").trim() && (
            <p className="whitespace-pre-wrap">
              {text.replace(oldFileMatch[0], "").trim()}
            </p>
          )}
        </div>
      );
    }

    return <p className="whitespace-pre-wrap">{text}</p>;
  };

  return (
    <div className="h-full flex flex-col rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[rgba(255,255,255,0.1)] bg-[rgba(9,22,18,0.8)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={onBack}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            <span className="relative inline-flex flex-shrink-0">
              <span className="rounded-full inline-flex items-center justify-center font-semibold bg-[rgba(89,216,195,0.14)] text-[#59D8C3] border border-[rgba(89,216,195,0.2)] w-9 h-9 text-xs">
                {conversation.customerInitial || "م"}
              </span>
              <span className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full border-2 border-[rgba(9,22,18,0.8)] bg-[#5be0a8]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">
                  {conversation.customerName || "مشتری ناشناس"}
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs ${badge.color}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full text-xs flex-shrink-0 ${badge.dotColor}`}
                  />
                  {badge.text}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {conversation.department || "بدون دپارتمان"} ·{" "}
                {conversation.customerPhone || "نامشخص"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(isAdmin || isManager) && (
              <div className="relative" ref={statusDropdownRef}>
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[rgba(242,184,75,0.08)] text-[#F2B84B] border border-[rgba(242,184,75,0.15)] hover:bg-[rgba(242,184,75,0.12)] transition-all"
                >
                  تغییر وضعیت
                </button>
                {showStatusDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-[#0D1B17] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="p-2 border-b border-[rgba(255,255,255,0.1)]">
                      <p className="text-xs text-gray-500">انتخاب وضعیت جدید</p>
                    </div>
                    {statusOptions.map((option) => {
                      const Icon = option.icon;
                      const isActive = conversation.status === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleStatusChange(option.id)}
                          className={`w-full text-right px-4 py-2.5 text-sm hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-2 ${
                            isActive ? "text-[#59D8C3]" : "text-white"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{option.label}</span>
                          {isActive && (
                            <span className="mr-auto text-[10px] text-[#59D8C3]">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ✅ دراپ‌دان تخصیص با لیست فیلتر شده */}
            {(isAdmin || isManager) && filteredEmployees.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[rgba(89,216,195,0.08)] text-[#59D8C3] border border-[rgba(89,216,195,0.15)] hover:bg-[rgba(89,216,195,0.12)] transition-all"
                >
                  {conversation.assignee ? "تغییر مسئول" : "تخصیص"}
                </button>
                {showAssignDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-[#0D1B17] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="p-2 border-b border-[rgba(255,255,255,0.1)]">
                      <p className="text-xs text-gray-500">انتخاب مسئول جدید</p>
                    </div>
                    {/* ✅ استفاده از filteredEmployees به جای assignableEmployees */}
                    {filteredEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => handleAssign(emp.id)}
                        className={cn(
                          "w-full text-right px-4 py-2.5 text-sm hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center justify-between",
                          conversation.assignee === emp.name
                            ? "text-[#59D8C3]"
                            : "text-white",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>{emp.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {emp.tickets || 0} گفتگو
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(isAdmin || isManager) && conversation.status !== "closed" && (
              <button
                onClick={handleClose}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[rgba(255,107,107,0.08)] text-red-400 border border-[rgba(255,107,107,0.15)] hover:bg-[rgba(255,107,107,0.12)] transition-all"
              >
                بستن
              </button>
            )}

            <button
              onClick={onToggleDetails}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                showDetails
                  ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                  : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-gray-500 hover:text-white hover:border-[rgba(255,255,255,0.2)]"
              }`}
            >
              اطلاعات
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[rgba(255,255,255,0.05)] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.3)] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.5)] p-4 space-y-4">
        {conversation.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center mb-3">
              <MessageCircle className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 text-sm">هنوز پیامی ارسال نشده</p>
            <p className="text-gray-500 text-xs mt-1">
              اولین پیام را شما ارسال کنید
            </p>
          </div>
        ) : (
          // ✅ مرتب‌سازی پیام‌ها بر اساس createdAt (قدیمی‌ترین اول)
          [...conversation.messages]
            .sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateA - dateB;
            })
            .map((msg) => {
              const isFromSupport = isMessageFromSupport(msg);

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isFromSupport ? "flex-row" : "flex-row-reverse"}`}
                >
                  <div className="flex flex-col max-w-[85%]">
                    <span
                      className={`text-xs text-gray-500 mb-1 ${isFromSupport ? "text-right" : "text-left"}`}
                    >
                      {msg.senderName || (isFromSupport ? "پشتیبانی" : "مشتری")}
                    </span>
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        isFromSupport
                          ? "bg-[rgba(89,216,195,0.12)] border border-[rgba(89,216,195,0.2)]"
                          : "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]"
                      }`}
                    >
                      {renderMessageContent(msg.text)}
                    </div>
                    <span
                      className={`text-[10px] text-gray-500 mt-1 ${isFromSupport ? "text-right" : "text-left"}`}
                    >
                      {msg.time || "چند لحظه پیش"}
                    </span>
                  </div>
                </div>
              );
            })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[rgba(255,255,255,0.1)] bg-[rgba(9,22,18,0.95)] p-4">
        {/* پیش‌نمایش فایل انتخاب شده */}
        {selectedFile && (
          <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
            {filePreview ? (
              <img
                src={filePreview}
                alt="preview"
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
                <Paperclip className="w-5 h-5 text-gray-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={removeSelectedFile}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-[rgba(255,107,107,0.1)] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            onClick={handleSend}
            disabled={
              (!newMessage.trim() && !selectedFile) || isSending || isUploading
            }
            className="w-10 h-10 rounded-3xl flex items-center justify-center transition-all bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 mb-3"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              placeholder={
                selectedFile ? "توضیح (اختیاری)..." : "پیام خود را بنویسید..."
              }
              value={newMessage}
              onChange={(e) => onNewMessageChange(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors scrollbar-hide"
              style={{
                minHeight: "48px",
                maxHeight: "160px",
                overflowY: "auto",
              }}
              disabled={isSending || isUploading}
            />
          </div>
          <div className="mb-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="*/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending || isUploading}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all disabled:opacity-50"
              title="ارسال فایل یا عکس"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          {conversation.status === "closed" && (
            <span className="text-[10px] text-red-400">
              این گفتگو بسته شده است
            </span>
          )}
        </div>
      </div>
    </div>
  );
}