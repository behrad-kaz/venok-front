"use client";

import { useState, useEffect } from "react";
import { useRoleStore } from "@/stores/useRoleStore";
import { ChevronRight } from "lucide-react";
import { myConversations } from "./employee/data";
import { Conversation } from "./employee/types";
import EmployeeConversationList from "./employee/EmployeeConversationList";
import EmployeeChatHeader from "./employee/EmployeeChatHeader";
import EmployeeChatMessages from "./employee/EmployeeChatMessages";
import EmployeeChatInput from "./employee/EmployeeChatInput";
import EmployeeDetailsSidebar from "./employee/EmployeeDetailsSidebar";
import EmployeeEmptyState from "./employee/EmployeeEmptyState";

type ViewMode = "list" | "chat" | "details";

export default function EmployeeDashboard() {
  const { role } = useRoleStore();
  const [conversations, setConversations] = useState<Conversation[]>(myConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isMobile, setIsMobile] = useState(false);
  
  const currentUser = "علی احمدی";
  const currentUserInitial = "ع";

  // تشخیص سایز صفحه
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // در موبایل، هنگام انتخاب چت، به حالت chat برو
  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setShowDetailsSidebar(false);
    if (isMobile) {
      setViewMode("chat");
    }
  };

  // بازگشت به لیست در موبایل
  const handleBackToList = () => {
    setViewMode("list");
    setShowDetailsSidebar(false);
  };

  // بازگشت به چت از جزئیات در موبایل
  const handleBackToChat = () => {
    setViewMode("chat");
    setShowDetailsSidebar(false);
  };

  const filteredConversations = conversations.filter((conv) => {
    if (statusFilter === "all") return true;
    return conv.status === statusFilter;
  });

  const handleSendMessage = (messageText: string, isInternalNote: boolean) => {
    if (!selectedConversation) return;
    
    const newMsg = {
      id: selectedConversation.messages.length + 1,
      senderName: currentUser,
      text: messageText,
      time: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
      isSupport: true,
      isInternalNote: isInternalNote,
    };
    
    const updatedConv = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMsg],
      lastMessage: messageText,
      time: "همین الان",
      lastActivity: "همین الان",
    };
    
    setConversations(conversations.map(c => c.id === selectedConversation.id ? updatedConv : c));
    setSelectedConversation(updatedConv);
  };

  const handleToggleDetails = () => {
    if (isMobile) {
      setViewMode("details");
    } else {
      setShowDetailsSidebar(!showDetailsSidebar);
    }
  };

  if (role !== "کارمند") {
    return null;
  }

  // حالت دسکتاپ - نمایش همه بخش‌ها
  if (!isMobile) {
    return (
      <div className="h-[calc(100vh-120px)] flex overflow-hidden">
        {/* سایدبار چپ - لیست گفتگوها */}
        <div className="w-80 lg:w-96 flex-shrink-0 border-l border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.01)] rounded-2xl overflow-hidden">
          <EmployeeConversationList
            conversations={filteredConversations}
            selectedConversation={selectedConversation}
            statusFilter={statusFilter}
            onSelectConversation={handleSelectConversation}
            onStatusFilterChange={setStatusFilter}
          />
        </div>

        {/* بخش اصلی - نمایش گفتگو */}
        <div className="flex-1 flex flex-col mr-4">
          {selectedConversation ? (
            <>
              <EmployeeChatHeader
                conversation={selectedConversation}
                currentUser={currentUser}
                currentUserInitial={currentUserInitial}
                onToggleDetails={handleToggleDetails}
              />
              <EmployeeChatMessages messages={selectedConversation.messages} source={selectedConversation.source} />
              <EmployeeChatInput onSendMessage={handleSendMessage} />
            </>
          ) : (
            <EmployeeEmptyState />
          )}
        </div>

        {/* سایدبار راست - جزئیات گفتگو */}
        {selectedConversation && showDetailsSidebar && (
          <EmployeeDetailsSidebar
            conversation={selectedConversation}
            isOpen={showDetailsSidebar}
            onClose={() => setShowDetailsSidebar(false)}
          />
        )}
      </div>
    );
  }

  // حالت موبایل - نمایش یک بخش در هر زمان
  return (
    <div className="h-[calc(100vh-120px)] overflow-hidden">
      {/* حالت لیست گفتگوها */}
      {viewMode === "list" && (
        <div className="h-full border-l border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.01)] rounded-2xl overflow-hidden">
          <EmployeeConversationList
            conversations={filteredConversations}
            selectedConversation={selectedConversation}
            statusFilter={statusFilter}
            onSelectConversation={handleSelectConversation}
            onStatusFilterChange={setStatusFilter}
          />
        </div>
      )}

      {/* حالت چت */}
      {viewMode === "chat" && selectedConversation && (
        <div className="h-full flex flex-col relative">
          {/* دکمه بازگشت */}
          <button
            onClick={handleBackToList}
            className=" z-10 w-6 h-6 mb-2 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-white hover:bg-[rgba(255,255,255,0.1)] transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <EmployeeChatHeader
            conversation={selectedConversation}
            currentUser={currentUser}
            currentUserInitial={currentUserInitial}
            onToggleDetails={handleToggleDetails}
          />
          <EmployeeChatMessages messages={selectedConversation.messages} source={selectedConversation.source} />
          <EmployeeChatInput onSendMessage={handleSendMessage} />
        </div>
      )}

      {/* حالت جزئیات */}
      {viewMode === "details" && selectedConversation && (
        <div className="h-full relative">       
          <EmployeeDetailsSidebar
            conversation={selectedConversation}
            isOpen={true}
            onClose={handleBackToChat}
          />
        </div>
      )}
    </div>
  );
}