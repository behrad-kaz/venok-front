// components/dashboard/conversations/index.tsx
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { useModal } from "@/components/ui/modal";
import { Conversation } from "./types";
import { getConversationsByDepartment, getStatusFiltersByDepartment, MANAGER_DEPARTMENT, assignableEmployees } from "./data";
import ConversationList from "./ConversationList";
import ConversationChat from "./ConversationChat";
import ConversationDetails from "./ConversationDetails";
import { useRoleStore } from "@/stores/useRoleStore";

type ViewMode = "list" | "chat" | "details";
type LayoutMode = "desktop" | "tablet" | "mobile";

export default function ConversationsContainer() {
  const { role } = useRoleStore();
  const { showSuccess, showInfo, showWarning, showError, showConfirm } = useModal();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [newMessage, setNewMessage] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("desktop");
  
  // ✅ استفاده از ref برای جلوگیری از اجرای مجدد useEffect
  const isInitialized = useRef(false);
  
  // دپارتمان مدیر (در حالت واقعی از پروفایل کاربر می‌آید)
  const userDepartment = role === "مدیر" ? MANAGER_DEPARTMENT : undefined;
  
  // ✅ استفاده از useMemo برای محاسبه مقادیر وابسته به role
  const { filtered, filters: initialFilters } = useMemo(() => {
    const filtered = getConversationsByDepartment(role, userDepartment);
    const filters = getStatusFiltersByDepartment(role, userDepartment);
    return { filtered, filters };
  }, [role, userDepartment]);

  // گفتگوهای فیلتر شده بر اساس نقش
  const [conversations, setConversations] = useState<Conversation[]>(filtered);
  const [filters, setFilters] = useState(initialFilters);

  // ✅ مقداردهی اولیه با useState و فقط یک بار اجرا
  useEffect(() => {
    if (!isInitialized.current && filtered.length > 0 && !selectedConversation) {
      setSelectedConversation(filtered[0]);
      isInitialized.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ به‌روزرسانی هنگام تغییر role با استفاده از useLayoutEffect یا useEffect با شرط
  useEffect(() => {
    // فقط زمانی که role تغییر کرده و مقداردهی اولیه انجام شده
    if (isInitialized.current) {
      const newFiltered = getConversationsByDepartment(role, userDepartment);
      const newFilters = getStatusFiltersByDepartment(role, userDepartment);
      
      setConversations(newFiltered);
      setFilters(newFilters);
      
      if (newFiltered.length > 0 && !selectedConversation) {
        setSelectedConversation(newFiltered[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, userDepartment]);

  // تشخیص سایز صفحه
  useEffect(() => {
    const checkLayout = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setLayoutMode("mobile");
      } else if (width < 1280) {
        setLayoutMode("tablet");
      } else {
        setLayoutMode("desktop");
      }
    };
    checkLayout();
    window.addEventListener("resize", checkLayout);
    return () => window.removeEventListener("resize", checkLayout);
  }, []);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      if (activeFilter !== "all" && conv.status !== activeFilter) return false;
      if (searchQuery && !conv.customerName.includes(searchQuery) && !conv.subject.includes(searchQuery)) return false;
      return true;
    });
  }, [conversations, activeFilter, searchQuery]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !selectedConversation) return;
    console.log("ارسال پیام:", newMessage);
    showSuccess("پیام با موفقیت ارسال شد", "موفقیت ✨");
    setNewMessage("");
  }, [newMessage, selectedConversation, showSuccess]);

  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowDetails(false);
    if (layoutMode === "mobile" || layoutMode === "tablet") {
      setViewMode("chat");
    }
  }, [layoutMode]);

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

  const handleToggleDetails = useCallback(() => {
    if (layoutMode === "mobile" || layoutMode === "tablet") {
      setShowDetails(true);
      setViewMode("details");
    } else {
      setShowDetails(!showDetails);
    }
  }, [layoutMode, showDetails]);

  const handleCloseDetails = useCallback(() => {
    if (layoutMode === "mobile" || layoutMode === "tablet") {
      setShowDetails(false);
      setViewMode("chat");
    } else {
      setShowDetails(false);
    }
  }, [layoutMode]);

  const handleChangeStatus = useCallback(() => {
    if (!selectedConversation) return;
    
    showInfo(
      `وضعیت فعلی: ${selectedConversation.status}\n\nبرای تغییر وضعیت از منوی کشویی استفاده کنید.`,
      "تغییر وضعیت گفتگو"
    );
  }, [selectedConversation, showInfo]);

  const handleAssign = useCallback(() => {
    if (!selectedConversation) return;
    
    const departmentName = role === "مدیر" ? MANAGER_DEPARTMENT : "همه دپارتمان‌ها";
    
    showInfo(
      `گفتگو با ${selectedConversation.customerName}\n\n` +
      `برای ارجاع به کارمندهای ${departmentName}، از بخش تخصیص استفاده کنید.`,
      "تخصیص/ارجاع گفتگو"
    );
  }, [selectedConversation, role, showInfo]);

  const handleCloseConversation = useCallback(() => {
    if (!selectedConversation) return;
    
    showConfirm(
      `آیا از بستن گفتگو با "${selectedConversation.customerName}" مطمئن هستید؟`,
      "تایید بستن گفتگو",
      () => {
        showSuccess(`گفتگو با ${selectedConversation.customerName} با موفقیت بسته شد`, "موفقیت ✨");
      }
    );
  }, [selectedConversation, showConfirm, showSuccess]);

  // حالت دسکتاپ - نمایش سه ستون (بزرگتر از 1280px)
  if (layoutMode === "desktop") {
    return (
      <div className="flex h-[calc(100vh-160px)] gap-4">
        <div className={`${showDetails ? "w-[300px]" : "w-[360px]"} flex-shrink-0 transition-all duration-300`}>
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
          />
        </div>

        <div className={`flex-1 transition-all duration-300`}>
          {selectedConversation ? (
            <ConversationChat
              conversation={selectedConversation}
              newMessage={newMessage}
              showDetails={showDetails}
              onNewMessageChange={setNewMessage}
              onSendMessage={handleSendMessage}
              onToggleDetails={handleToggleDetails}
              onBack={handleBackToList}
              isMobile={false}
              role={role}
              assignableEmployees={role === "مدیر" ? assignableEmployees : undefined}
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
          <div className="w-[320px] flex-shrink-0 transition-all duration-300">
            <ConversationDetails
              conversation={selectedConversation}
              onClose={handleCloseDetails}
              onChangeStatus={handleChangeStatus}
              onAssign={handleAssign}
              onCloseConversation={handleCloseConversation}
              role={role}
            />
          </div>
        )}
      </div>
    );
  }

  // حالت تبلت - نمایش دو ستون
  if (layoutMode === "tablet") {
    return (
      <div className="flex h-[calc(100vh-160px)] gap-4">
        <div className="w-[320px] flex-shrink-0">
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
          />
        </div>

        <div className="flex-1">
          {viewMode === "chat" && selectedConversation && (
            <ConversationChat
              conversation={selectedConversation}
              newMessage={newMessage}
              showDetails={false}
              onNewMessageChange={setNewMessage}
              onSendMessage={handleSendMessage}
              onToggleDetails={handleToggleDetails}
              onBack={handleBackToList}
              isMobile={false}
              isTablet={true}
              role={role}
              assignableEmployees={role === "مدیر" ? assignableEmployees : undefined}
            />
          )}

          {viewMode === "details" && selectedConversation && (
            <ConversationDetails
              conversation={selectedConversation}
              onClose={handleCloseDetails}
              onChangeStatus={handleChangeStatus}
              onAssign={handleAssign}
              onCloseConversation={handleCloseConversation}
              onBack={handleBackToChat}
              isMobile={false}
              isTablet={true}
              role={role}
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

  // حالت موبایل - نمایش یک ستون
  return (
    <div className="h-[calc(100vh-160px)]">
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
        />
      )}

      {viewMode === "chat" && selectedConversation && (
        <ConversationChat
          conversation={selectedConversation}
          newMessage={newMessage}
          showDetails={false}
          onNewMessageChange={setNewMessage}
          onSendMessage={handleSendMessage}
          onToggleDetails={handleToggleDetails}
          onBack={handleBackToList}
          isMobile={true}
          role={role}
          assignableEmployees={role === "مدیر" ? assignableEmployees : undefined}
        />
      )}

      {viewMode === "details" && selectedConversation && (
        <ConversationDetails
          conversation={selectedConversation}
          onClose={handleCloseDetails}
          onChangeStatus={handleChangeStatus}
          onAssign={handleAssign}
          onCloseConversation={handleCloseConversation}
          onBack={handleBackToChat}
          isMobile={true}
          role={role}
        />
      )}
    </div>
  );
}