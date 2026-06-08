// components/dashboard/conversations/index.tsx
"use client";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
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
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [newMessage, setNewMessage] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("desktop");
  
  // دپارتمان مدیر (در حالت واقعی از پروفایل کاربر می‌آید)
  const userDepartment = role === "مدیر" ? MANAGER_DEPARTMENT : undefined;
  
  // گفتگوهای فیلتر شده بر اساس نقش
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filters, setFilters] = useState(getStatusFiltersByDepartment(role, userDepartment));

  useEffect(() => {
    // بارگذاری گفتگوهای مناسب با نقش
    const filtered = getConversationsByDepartment(role, userDepartment);
    setConversations(filtered);
    setFilters(getStatusFiltersByDepartment(role, userDepartment));
    if (filtered.length > 0 && !selectedConversation) {
      setSelectedConversation(filtered[0]);
    }
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

  const filteredConversations = conversations.filter((conv) => {
    if (activeFilter !== "all" && conv.status !== activeFilter) return false;
    if (searchQuery && !conv.customerName.includes(searchQuery) && !conv.subject.includes(searchQuery)) return false;
    return true;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    console.log("ارسال پیام:", newMessage);
    setNewMessage("");
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowDetails(false);
    if (layoutMode === "mobile") {
      setViewMode("chat");
    } else if (layoutMode === "tablet") {
      setViewMode("chat");
    }
  };

  const handleBackToList = () => {
    if (layoutMode === "mobile") {
      setViewMode("list");
      setShowDetails(false);
    } else if (layoutMode === "tablet") {
      setViewMode("list");
      setShowDetails(false);
    }
  };

  const handleBackToChat = () => {
    if (layoutMode === "mobile" && showDetails) {
      setShowDetails(false);
      setViewMode("chat");
    } else if (layoutMode === "tablet" && showDetails) {
      setShowDetails(false);
      setViewMode("chat");
    }
  };

  const handleToggleDetails = () => {
    if (layoutMode === "mobile") {
      setShowDetails(true);
      setViewMode("details");
    } else if (layoutMode === "tablet") {
      setShowDetails(true);
      setViewMode("details");
    } else {
      setShowDetails(!showDetails);
    }
  };

  const handleCloseDetails = () => {
    if (layoutMode === "mobile") {
      setShowDetails(false);
      setViewMode("chat");
    } else if (layoutMode === "tablet") {
      setShowDetails(false);
      setViewMode("chat");
    } else {
      setShowDetails(false);
    }
  };

  const handleChangeStatus = () => {
    alert("تغییر وضعیت گفتگو");
  };

  const handleAssign = () => {
    // برای مدیر دپارتمان، فقط کارمندهای دپارتمان خودش را نشان می‌دهد
    if (role === "مدیر") {
      alert(`ارجاع به کارمندهای دپارتمان ${MANAGER_DEPARTMENT}`);
    } else {
      alert("ارجاع به کارمند");
    }
  };

  const handleCloseConversation = () => {
    if (selectedConversation) {
      alert(`گفتگو با ${selectedConversation.customerName} بسته شد`);
    }
  };

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