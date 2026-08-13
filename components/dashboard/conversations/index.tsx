'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { useModal } from "@/components/ui/modal";
import { Conversation, AssignableEmployee } from "./types";
import ConversationList from "./ConversationList";
import ConversationChat from "./ConversationChat";
import ConversationDetails from "./ConversationDetails";
import { useRoleStore } from "@/stores/useRoleStore";
import { api } from "@/services/api-client";
import { authService } from "@/services/auth.service";
import { useSocket } from "@/hooks/useSocket";
import { config } from "@/lib/config";

type ViewMode = "list" | "chat" | "details";
type LayoutMode = "desktop" | "tablet" | "mobile";

export default function ConversationsContainer() {
  const { role } = useRoleStore();
  const { showSuccess, showError, showConfirm } = useModal();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [newMessage, setNewMessage] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("desktop");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [assignableEmployees, setAssignableEmployees] = useState<
    AssignableEmployee[]
  >([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [userStaffInfo, setUserStaffInfo] = useState<{
    id: number;
    departmentId: number | null;
    role: string;
    name: string;
  } | null>(null);

  const isInitialized = useRef(false);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);
  const lastReadTimestamps = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('conversationLastReadTimestamps');
      if (stored) {
        const parsed = JSON.parse(stored);
        const map = new Map<number, number>();
        if (Array.isArray(parsed)) {
          parsed.forEach(([key, value]) => {
            map.set(Number(key), Number(value));
          });
        }
        lastReadTimestamps.current = map;
      }
    } catch {
      // ignore
    }
  }, []);

  const persistLastReadTimestamps = useCallback((map: Map<number, number>) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('conversationLastReadTimestamps', JSON.stringify(Array.from(map.entries())));
    } catch {
      // ignore
    }
  }, []);

  const isAdmin = role === "مدیر کل";
  const isManager = role === "مدیر";

  const [currentUser] = useState(() => {
    if (typeof window === "undefined") return null;
    return authService.getStoredUserData();
  });

  const userDepartment = useMemo(() => {
    if (typeof window === "undefined") return "";
    if (isAdmin) return "";

    if (userStaffInfo?.departmentId) {
      const foundDept = assignableEmployees.find(
        (emp) => emp.departmentId === userStaffInfo.departmentId,
      );
      if (foundDept?.department) {
        return foundDept.department;
      }

      const dept =
        localStorage.getItem("userDepartment") ||
        localStorage.getItem("departmentName") ||
        "";
      return dept;
    }

    const dept =
      localStorage.getItem("userDepartment") ||
      localStorage.getItem("departmentName") ||
      "";
    return dept;
  }, [isAdmin, userStaffInfo, assignableEmployees]);

  // ✅ اصلاح: فقط پیام‌های جدید از Socket را اضافه کن
  const calculateUnreadCount = useCallback((messages: any[], conversationId: number) => {
    const lastReadAt = lastReadTimestamps.current.get(conversationId) || 0;
    return messages.filter(
      (msg) => msg.senderType === "customer" && new Date(msg.createdAt || 0).getTime() > lastReadAt
    ).length;
  }, []);

  const handleNewMessage = useCallback((message: any) => {
    console.log("📩 پیام جدید از Socket:", message);

    const msgId = String(message.id);
    const convId = typeof message.conversationId === "string" 
      ? parseInt(message.conversationId) 
      : message.conversationId;

    const supportName =
      currentUser?.staffName ||
      (currentUser?.firstName && currentUser?.lastName
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : undefined) ||
      currentUser?.userName ||
      "پشتیبانی";
    const customerName = selectedConversation?.id === convId
      ? selectedConversation.customerName
      : "مشتری";

    // ✅ اگر پیام قبلاً در UI وجود دارد، نادیده بگیر
    let exists = false;
    
    // بررسی در selectedConversation
    setSelectedConversation((prev) => {
      if (!prev) return prev;
      if (prev.id !== convId) return prev;
      
      const found = prev.messages.some((m) => String(m.id) === msgId);
      if (found) {
        exists = true;
        console.log("⚠️ پیام تکراری در selectedConversation، نادیده گرفته شد:", msgId);
        return prev;
      }

      const isCurrentUserMessage = currentUser && (
        (currentUser.staffId && message.senderId === currentUser.staffId) ||
        (currentUser.userId && message.senderId === currentUser.userId)
      );

      let senderDisplayName = message.senderName;
      if (isCurrentUserMessage && (message.senderType === "agent" || message.senderType === "admin" || message.senderType === "support")) {
        senderDisplayName = supportName;
      }

      const newMsg = {
        id: msgId,
        senderName: senderDisplayName || (message.senderType === "customer" ? customerName : supportName),
        text: message.text,
        time: message.timestamp ? new Date(message.timestamp).toLocaleTimeString("fa-IR") : "همین الان",
        isSupport: message.senderType === "agent" || message.senderType === "support" || message.senderType === "admin",
        isInternal: message.isInternal || false,
        senderType: message.senderType || "customer",
        senderId: message.senderId || null,
        fileUrl: message.fileUrl || null,
        fileType: message.fileType || null,
        createdAt: message.timestamp || new Date().toISOString(),
      };

      const updatedMessages = [...prev.messages, newMsg].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });

      if (prev.id === convId) {
        lastReadTimestamps.current.set(convId, Date.now());
        persistLastReadTimestamps(lastReadTimestamps.current);
      }

      return {
        ...prev,
        messages: updatedMessages,
        lastMessage: newMsg.text,
        time: "همین الان",
        unreadCount: 0,
      };
    });

    // اگر پیام در selectedConversation وجود داشت، ادامه نده
    if (exists) return;

    // بررسی در conversations
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== convId) return conv;

        const found = conv.messages.some((m) => String(m.id) === msgId);
        if (found) {
          console.log("⚠️ پیام تکراری در conversations، نادیده گرفته شد:", msgId);
          return conv;
        }

        const isCurrentUserMessage = currentUser && (
          (currentUser.staffId && message.senderId === currentUser.staffId) ||
          (currentUser.userId && message.senderId === currentUser.userId)
        );

        let senderDisplayName = message.senderName;
        if (isCurrentUserMessage && (message.senderType === "agent" || message.senderType === "admin" || message.senderType === "support")) {
          senderDisplayName = supportName;
        }

        const newMsg = {
          id: msgId,
          senderName: senderDisplayName || (message.senderType === "customer" ? customerName : supportName),
          text: message.text,
          time: message.timestamp ? new Date(message.timestamp).toLocaleTimeString("fa-IR") : "همین الان",
          isSupport: message.senderType === "agent" || message.senderType === "support" || message.senderType === "admin",
          isInternal: message.isInternal || false,
          senderType: message.senderType || "customer",
          senderId: message.senderId || null,
          fileUrl: message.fileUrl || null,
          fileType: message.fileType || null,
          createdAt: message.timestamp || new Date().toISOString(),
        };

        const updatedMessages = [...conv.messages, newMsg].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        });

        return {
          ...conv,
          messages: updatedMessages,
          lastMessage: newMsg.text,
          time: "همین الان",
          unreadCount: calculateUnreadCount(updatedMessages, conv.id),
        };
      }),
    );
  }, [currentUser, selectedConversation, calculateUnreadCount, persistLastReadTimestamps]);

  const { isConnected, socketRef } = useSocket({
    apiBaseUrl: config.apiBaseUrl,
    conversationId: selectedConversation?.id?.toString() || "",
    token:
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken") || ""
        : "",
    onMessage: handleNewMessage,
    onConnect: () => console.log("✅ Socket connected"),
    onDisconnect: () => console.log("🔌 Socket disconnected"),
    onError: (error) => console.error("❌ Socket error:", error),
  });

  useEffect(() => {
    const fetchStaffInfo = async () => {
      if (isAdmin) {
        const adminName =
          (currentUser?.firstName && currentUser?.lastName
            ? `${currentUser.firstName} ${currentUser.lastName}`
            : undefined) ||
          currentUser?.staffName ||
          "مدیر کل";

        setUserStaffInfo({
          id: 0,
          departmentId: null,
          role: "admin",
          name: adminName,
        });
        return;
      }

      try {
        const staffId = authService.getStaffId();
        if (!staffId) {
          console.warn("⚠️ staffId وجود ندارد");
          return;
        }

        const response = await api.get<{
          id: number;
          departmentId: number | null;
          role: string;
          name: string;
        }>(`/staff/${staffId}`);
        setUserStaffInfo(response);
      } catch (error) {
        console.error("❌ خطا در دریافت اطلاعات staff:", error);
      }
    };

    fetchStaffInfo();
  }, [isAdmin, currentUser]);

  const loadAssignableEmployees = useCallback(async () => {
    if (!isAdmin && !isManager) {
      return;
    }

    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;

    try {
      const staffResponse = await api.get<any[]>("/staff");
      let staffs = Array.isArray(staffResponse)
        ? staffResponse
        : staffResponse?.data || [];

      const convResponse = await api.get<{ data: any[] }>("/conversation");
      const conversations = convResponse.data || [];

      const openConversationsCount: Record<number, number> = {};

      conversations.forEach((conv: any) => {
        if (conv.status !== "closed" && conv.agentId) {
          const agentId = conv.agentId;
          openConversationsCount[agentId] =
            (openConversationsCount[agentId] || 0) + 1;
        }
      });

      const mapped = staffs
        .filter((staff: any) => staff.deletedAt === null)
        .map((staff: any) => ({
          id: staff.id,
          name: staff.name,
          department: staff.department?.name || "بدون دپارتمان",
          departmentId: staff.departmentId || null,
          tickets: openConversationsCount[staff.id] || 0,
          role: staff.role,
        }));

      setAssignableEmployees(mapped);

      if (isManager && userStaffInfo?.departmentId) {
        const userDept = mapped.find(
          (emp) => emp.departmentId === userStaffInfo.departmentId,
        );
        if (userDept?.department) {
          localStorage.setItem("userDepartment", userDept.department);
          localStorage.setItem("departmentName", userDept.department);
        }
      }
    } catch (error) {
      console.error("❌ خطا در دریافت لیست کارمندان:", error);
      setAssignableEmployees([]);
    } finally {
      isLoadingRef.current = false;
    }
  }, [isAdmin, isManager, userStaffInfo]);

  const loadConversations = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      setIsLoading(true);

      const response = await api.get<{ data: any[] }>("/conversation");
      let convs = response.data || [];

      if (isAdmin) {
        console.log("👑 مدیر کل: نمایش همه گفتگوها");
      } else {
        const staffId = authService.getStaffId();
        const departmentId = userStaffInfo?.departmentId || null;

        if (role === "کارمند") {
          if (staffId) {
            convs = convs.filter((conv: any) => conv.agentId === staffId);
          } else {
            convs = [];
          }
        } else if (role === "مدیر") {
          if (departmentId) {
            convs = convs.filter((conv: any) => conv.teamId === departmentId);
          } else {
            convs = [];
          }
        }
      }

      const formatted = convs.map((conv: any) => {
        const customerName =
          conv.customer?.name || conv.customerName || "مشتری ناشناس";

        const mappedMessages = (conv.messages || [])
          .slice()
          .sort((a: any, b: any) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateA - dateB;
          })
          .map((msg: any) => ({
            id: msg.id,
            senderName:
              msg.senderName ||
              (msg.senderType === "customer" ? "مشتری" : "پشتیبانی"),
            text: msg.content,
            time: msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString("fa-IR")
              : "",
            isSupport:
              msg.senderType === "agent" ||
              msg.senderType === "support" ||
              msg.senderType === "admin",
            isInternal: msg.isInternalNote || false,
            senderType: msg.senderType || "customer",
            senderId: msg.senderId ?? null,
            fileUrl: msg.fileUrl || null,
            fileType: msg.fileType || null,
            createdAt: msg.createdAt,
          }));

        const unreadCount = calculateUnreadCount(mappedMessages, conv.id);

        return {
          id: conv.id,
          customerName: customerName,
          customerId: conv.customer?.id || conv.customerId || null,
          customer: conv.customer || null,
          customerInitial: customerName.charAt(0) || "م",
          customerPhone: conv.customerPhone || "نامشخص",
          subject: conv.subject || "بدون موضوع",
          lastMessage: mappedMessages[mappedMessages.length - 1]?.text || "بدون پیام",
          time: conv.lastActivity
            ? new Date(conv.lastActivity).toLocaleString("fa-IR")
            : "چند لحظه پیش",
          status: conv.status || "open",
          department: conv.team?.name || "بدون دپارتمان",
          departmentId: conv.teamId || conv.team?.id || null,
          assignee: conv.agent?.name || "",
          assigneeId: conv.agentId || conv.agent?.id || null,
          source: conv.source || "ویجت سایت",
          startDate: conv.createdAt
            ? new Date(conv.createdAt).toLocaleDateString("fa-IR")
            : "",
          priority: conv.priority || "normal",
          unreadCount,
          messages: mappedMessages,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        };
      });

      setConversations(formatted);

      if (formatted.length > 0 && !selectedConversation) {
        setSelectedConversation(formatted[0]);
      }
    } catch (error) {
      console.error("❌ خطا در دریافت گفتگوها:", error);
      showError("خطا در بارگذاری گفتگوها");
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [selectedConversation, showError, role, userStaffInfo, isAdmin, calculateUnreadCount]);

  useEffect(() => {
    if (isAdmin) {
      if (!isInitialized.current) {
        isInitialized.current = true;
        (async () => {
          try {
            await loadConversations();
            await loadAssignableEmployees();
          } catch (error) {
            console.error("❌ خطا در بارگذاری اولیه:", error);
          }
        })();
      }
      return;
    }

    if (userStaffInfo !== null && !isInitialized.current) {
      isInitialized.current = true;
      (async () => {
        try {
          await loadConversations();
          await loadAssignableEmployees();
        } catch (error) {
          console.error("❌ خطا در بارگذاری اولیه:", error);
        }
      })();
    }
  }, [userStaffInfo, loadConversations, loadAssignableEmployees, isAdmin]);

  useEffect(() => {
    if (userStaffInfo !== null || isAdmin) {
      refreshInterval.current = setInterval(() => {
        loadConversations();
      }, 60000);
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [userStaffInfo, isAdmin, loadConversations]);

  const filters = useMemo(() => {
    const counts = {
      all: conversations.length,
      open: conversations.filter((c) => c.status === "open").length,
      waiting: conversations.filter((c) => c.status === "waiting").length,
      answered: conversations.filter((c) => c.status === "answered").length,
      closed: conversations.filter((c) => c.status === "closed").length,
    };
    return [
      { id: "all", label: "همه", count: counts.all },
      { id: "open", label: "باز", count: counts.open },
      { id: "waiting", label: "در انتظار", count: counts.waiting },
      { id: "answered", label: "پاسخ داده شده", count: counts.answered },
      { id: "closed", label: "بسته شده", count: counts.closed },
    ];
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      if (activeFilter !== "all" && conv.status !== activeFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName =
          conv.customerName?.toLowerCase().includes(query) || false;
        const matchSubject =
          conv.subject?.toLowerCase().includes(query) || false;
        const matchPhone = conv.customerPhone?.includes(query) || false;
        const matchAssignee =
          conv.assignee?.toLowerCase().includes(query) || false;
        const matchDepartment =
          conv.department?.toLowerCase().includes(query) || false;
        if (
          !matchName &&
          !matchSubject &&
          !matchPhone &&
          !matchAssignee &&
          !matchDepartment
        )
          return false;
      }
      return true;
    });
  }, [conversations, activeFilter, searchQuery]);

  // ✅ اصلاح: فقط Socket با pendingMessageIds
  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!selectedConversation || !message.trim() || isSending) return;

      setIsSending(true);

      try {
        if (isConnected && socketRef.current) {
          socketRef.current.emit("send_message", {
            conversationId: selectedConversation.id.toString(),
            text: message,
            isInternal: false,
            senderName:
              currentUser?.staffName ||
              (currentUser?.firstName && currentUser?.lastName
                ? `${currentUser.firstName} ${currentUser.lastName}`
                : undefined) ||
              currentUser?.userName ||
              "پشتیبانی",
            senderType: "agent",
          });

          showSuccess("پیام با موفقیت ارسال شد");
        } else {
          console.error("❌ Socket متصل نیست، پیام ارسال نشد");
          showError("اتصال به سرور برقرار نیست. لطفاً دوباره تلاش کنید.");
        }
      } catch (error) {
        console.error("❌ خطا در ارسال پیام:", error);
        showError("خطا در ارسال پیام");
      } finally {
        setIsSending(false);
      }
    },
    [
      selectedConversation,
      isSending,
      showSuccess,
      showError,
      currentUser,
      isConnected,
      socketRef,
    ],
  );

  const handleSelectConversation = useCallback(
    (conversation: Conversation) => {
      setSelectedConversation(conversation);
      setShowDetails(false);
      if (layoutMode === "mobile" || layoutMode === "tablet") {
        setViewMode("chat");
      }
      const now = Date.now();
      lastReadTimestamps.current.set(conversation.id, now);
      persistLastReadTimestamps(lastReadTimestamps.current);

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversation.id
            ? { ...conv, unreadCount: 0 }
            : conv,
        ),
      );
    },
    [layoutMode, persistLastReadTimestamps],
  );

  const handleAssignConversation = useCallback(
    async (staffId: number) => {
      if (!selectedConversation) return;

      setIsAssigning(true);

      try {
        await api.patch(`/conversation/${selectedConversation.id}`, {
          agentId: staffId,
        });

        const assignedStaff = assignableEmployees.find(
          (emp) => emp.id === staffId,
        );

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === selectedConversation.id) {
              return {
                ...conv,
                assignee: assignedStaff?.name || "",
                assigneeId: staffId,
              };
            }
            return conv;
          }),
        );

        setSelectedConversation((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            assignee: assignedStaff?.name || "",
            assigneeId: staffId,
          };
        });

        showSuccess(
          `گفتگو با موفقیت به ${assignedStaff?.name || "کارمند"} تخصیص داده شد`,
        );
      } catch (error) {
        console.error("❌ خطا در تخصیص گفتگو:", error);
        showError("خطا در تخصیص گفتگو");
      } finally {
        setIsAssigning(false);
      }
    },
    [selectedConversation, assignableEmployees, showSuccess, showError],
  );

  const handleChangeStatus = useCallback(
    async (status: string) => {
      if (!selectedConversation) return;

      try {
        await api.patch(`/conversation/${selectedConversation.id}`, {
          status: status,
        });

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === selectedConversation.id) {
              return {
                ...conv,
                status: status as any,
              };
            }
            return conv;
          }),
        );

        setSelectedConversation((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: status as any,
          };
        });

        const statusLabels: Record<string, string> = {
          open: "باز",
          waiting: "در انتظار پاسخ",
          answered: "پاسخ داده شده",
          closed: "بسته شده",
        };
        showSuccess(
          `وضعیت گفتگو به "${statusLabels[status] || status}" تغییر یافت`,
        );
      } catch (error) {
        console.error("❌ خطا در تغییر وضعیت:", error);
        showError("خطا در تغییر وضعیت گفتگو");
      }
    },
    [selectedConversation, showSuccess, showError],
  );

  const handleCloseConversation = useCallback(async () => {
    if (!selectedConversation) return;

    showConfirm(
      `آیا از بستن گفتگو با "${selectedConversation.customerName}" مطمئن هستید؟`,
      "تایید بستن گفتگو",
      async () => {
        try {
          await api.patch(`/conversation/${selectedConversation.id}`, {
            status: "closed",
          });

          setConversations((prev) =>
            prev.map((conv) => {
              if (conv.id === selectedConversation.id) {
                return {
                  ...conv,
                  status: "closed",
                };
              }
              return conv;
            }),
          );

          setSelectedConversation((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              status: "closed",
            };
          });

          showSuccess(
            `گفتگو با ${selectedConversation.customerName} با موفقیت بسته شد`,
          );
        } catch (error) {
          console.error("❌ خطا در بستن گفتگو:", error);
          showError("خطا در بستن گفتگو");
        }
      },
    );
  }, [selectedConversation, showConfirm, showSuccess, showError]);

  useEffect(() => {
    const checkLayout = () => {
      const width = window.innerWidth;
      if (width < 768) setLayoutMode("mobile");
      else if (width < 1024) setLayoutMode("tablet");
      else setLayoutMode("desktop");
    };
    checkLayout();
    window.addEventListener("resize", checkLayout);
    return () => window.removeEventListener("resize", checkLayout);
  }, []);

  const handleBackToList = useCallback(() => {
    if (layoutMode === "mobile" || layoutMode === "tablet") {
      setViewMode("list");
      setShowDetails(false);
    }
  }, [layoutMode]);

  const handleBackToChat = useCallback(() => {
    if ((layoutMode === "mobile" || layoutMode === "tablet") && showDetails) {
      setShowDetails(false);
      setViewMode("chat");
    }
  }, [layoutMode, showDetails]);

  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <Loader2 className="w-8 h-8 text-[#59D8C3] animate-spin" />
        <span className="mr-3 text-gray-400">در حال بارگذاری گفتگوها...</span>
      </div>
    );
  }

  if (layoutMode === "desktop") {
    return (
      <div className="flex h-[calc(100vh-120px)] gap-4 ">
        <div
          className={`${showDetails ? "w-[300px]" : "w-[360px]"} flex-shrink-0 transition-all duration-300 h-full`}
        >
          <ConversationList
            conversations={filteredConversations}
            selectedConversation={selectedConversation}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            showDetails={showDetails}
            onSearchChange={setSearchQuery}
            onFilterChange={setActiveFilter}
            onSelectConversation={handleSelectConversation}
            filters={filters}
            role={role}
            isLoading={isLoading}
            currentUserName={currentUser?.userName || null}
          />
        </div>

        <div className="flex-1 h-full transition-all duration-300">
          {selectedConversation ? (
            <ConversationChat
              conversation={selectedConversation}
              newMessage={newMessage}
              showDetails={showDetails}
              onNewMessageChange={setNewMessage}
              onSendMessage={handleSendMessage}
              onToggleDetails={() => setShowDetails(!showDetails)}
              onBack={handleBackToList}
              isMobile={false}
              role={role}
              assignableEmployees={assignableEmployees}
              onAssignConversation={handleAssignConversation}
              onStatusChange={handleChangeStatus}
              onCloseConversation={handleCloseConversation}
              isAdmin={isAdmin}
              isManager={isManager}
              departmentName={userDepartment}
              socketRef={socketRef}
              currentUser={currentUser}
            />
          ) : (
            <div className="h-full flex items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">گفتگویی را انتخاب کنید</p>
              </div>
            </div>
          )}
        </div>

        {showDetails && selectedConversation && (
          <div className="w-[320px] flex-shrink-0 h-full transition-all duration-300">
            <ConversationDetails
              conversation={selectedConversation}
              onClose={() => setShowDetails(false)}
              onChangeStatus={() =>
                handleChangeStatus(
                  selectedConversation.status === "closed" ? "open" : "closed",
                )
              }
              onAssign={() => {}}
              onCloseConversation={handleCloseConversation}
              onBack={handleBackToChat}
              isMobile={false}
              isTablet={false}
              role={role}
              assignableEmployees={assignableEmployees}
              onAssignConversation={handleAssignConversation}
              isAdmin={isAdmin}
              isManager={isManager}
              departmentName={userDepartment}
            />
          </div>
        )}
      </div>
    );
  }

  if (layoutMode === "tablet") {
    return (
      <div className="flex h-[calc(100vh-120px)] gap-4">
        <div className="w-[320px] flex-shrink-0 h-full">
          <ConversationList
            conversations={filteredConversations}
            selectedConversation={selectedConversation}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            showDetails={false}
            onSearchChange={setSearchQuery}
            onFilterChange={setActiveFilter}
            onSelectConversation={handleSelectConversation}
            filters={filters}
            isTablet={true}
            role={role}
            isLoading={isLoading}
            currentUserName={currentUser?.userName || null}
          />
        </div>

        <div className="flex-1 h-full">
          {viewMode === "chat" && selectedConversation && (
            <ConversationChat
              conversation={selectedConversation}
              newMessage={newMessage}
              showDetails={false}
              onNewMessageChange={setNewMessage}
              onSendMessage={handleSendMessage}
              onToggleDetails={() => setShowDetails(!showDetails)}
              onBack={handleBackToList}
              isMobile={false}
              isTablet={true}
              role={role}
              assignableEmployees={assignableEmployees}
              onAssignConversation={handleAssignConversation}
              onStatusChange={handleChangeStatus}
              onCloseConversation={handleCloseConversation}
              isAdmin={isAdmin}
              isManager={isManager}
              departmentName={userDepartment}
              socketRef={socketRef}
              currentUser={currentUser}
            />
          )}

          {viewMode === "details" && selectedConversation && (
            <ConversationDetails
              conversation={selectedConversation}
              onClose={() => setShowDetails(false)}
              onChangeStatus={() =>
                handleChangeStatus(
                  selectedConversation.status === "closed" ? "open" : "closed",
                )
              }
              onAssign={() => {}}
              onCloseConversation={handleCloseConversation}
              onBack={handleBackToChat}
              isMobile={false}
              isTablet={true}
              role={role}
              assignableEmployees={assignableEmployees}
              onAssignConversation={handleAssignConversation}
              isAdmin={isAdmin}
              isManager={isManager}
              departmentName={userDepartment}
            />
          )}

          {!selectedConversation && (
            <div className="h-full flex items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">گفتگویی را انتخاب کنید</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      {viewMode === "list" && (
        <ConversationList
          conversations={filteredConversations}
          selectedConversation={selectedConversation}
          searchQuery={searchQuery}
          activeFilter={activeFilter}
          showDetails={false}
          onSearchChange={setSearchQuery}
          onFilterChange={setActiveFilter}
          onSelectConversation={handleSelectConversation}
          filters={filters}
          isMobile={true}
          role={role}
          isLoading={isLoading}
          currentUserName={currentUser?.userName || null}
        />
      )}

      {viewMode === "chat" && selectedConversation && (
        <ConversationChat
          conversation={selectedConversation}
          newMessage={newMessage}
          showDetails={false}
          onNewMessageChange={setNewMessage}
          onSendMessage={handleSendMessage}
          onToggleDetails={() => setShowDetails(!showDetails)}
          onBack={handleBackToList}
          isMobile={true}
          role={role}
          assignableEmployees={assignableEmployees}
          onAssignConversation={handleAssignConversation}
          onStatusChange={handleChangeStatus}
          onCloseConversation={handleCloseConversation}
          isAdmin={isAdmin}
          isManager={isManager}
          departmentName={userDepartment}
          socketRef={socketRef}
          currentUser={currentUser}
        />
      )}

      {viewMode === "details" && selectedConversation && (
        <ConversationDetails
          conversation={selectedConversation}
          onClose={() => setShowDetails(false)}
          onChangeStatus={() =>
            handleChangeStatus(
              selectedConversation.status === "closed" ? "open" : "closed",
            )
          }
          onAssign={() => {}}
          onCloseConversation={handleCloseConversation}
          onBack={handleBackToChat}
          isMobile={true}
          role={role}
          assignableEmployees={assignableEmployees}
          onAssignConversation={handleAssignConversation}
          isAdmin={isAdmin}
          isManager={isManager}
          departmentName={userDepartment}
        />
      )}
    </div>
  );
}