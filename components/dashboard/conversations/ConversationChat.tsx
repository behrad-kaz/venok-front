'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, ChevronRight, Loader2, User, Users, CheckCircle, Clock, MessageCircle } from 'lucide-react';
import { Conversation } from './types';
import { getStatusBadge } from './data';
import { UserRole } from '@/stores/useRoleStore';
import { api } from '@/services/api-client';
import { useModal } from '@/components/ui/modal';

interface AssignableEmployee {
  id: number;
  name: string;
  department: string;
  tickets: number;
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
}: ConversationChatProps) {
  const { showSuccess, showError, showConfirm } = useModal();
  const badge = getStatusBadge(conversation.status);
  const [isSending, setIsSending] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  
  const showBackButton = isMobile || isTablet;
  const isAdmin = role === 'مدیر کل';
  const isManager = role === 'مدیر';
  const isEmployee = role === 'کارمند';

  // اسکرول به پایین
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  // بستن dropdown با کلیک خارج
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAssignDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    
    try {
      // ✅ ارسال پیام از طریق Socket.io برای لایو بودن
      if (socketRef?.current?.connected) {
        socketRef.current.emit('send_message', {
          conversationId: String(conversation.id),
          text: newMessage,
          isInternal: false,
        });
      }
      
      // ✅ ارسال پیام از طریق API
      await onSendMessage(newMessage);
    } catch (error) {
      console.error('❌ خطا در ارسال پیام:', error);
      showError('خطا در ارسال پیام');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAssign = (staffId: number) => {
    if (onAssignConversation) {
      onAssignConversation(staffId);
      setShowAssignDropdown(false);
      showSuccess('گفتگو با موفقیت تخصیص داده شد');
    }
  };

  const handleStatusChange = (status: string) => {
    if (onStatusChange) {
      onStatusChange(status);
      setShowStatusDropdown(false);
      
      const statusLabels: Record<string, string> = {
        open: 'باز',
        waiting: 'در انتظار پاسخ',
        answered: 'پاسخ داده شده',
        closed: 'بسته شده',
      };
      showSuccess(`وضعیت گفتگو به "${statusLabels[status] || status}" تغییر یافت`);
    }
  };

  const handleClose = () => {
    showConfirm(
      `آیا از بستن گفتگو با "${conversation.customerName}" مطمئن هستید؟`,
      'تایید بستن گفتگو',
      () => {
        if (onCloseConversation) {
          onCloseConversation();
          showSuccess(`گفتگو با ${conversation.customerName} بسته شد`);
        }
      }
    );
  };

  const statusOptions = [
    { id: 'open', label: 'باز', icon: Clock },
    { id: 'waiting', label: 'در انتظار پاسخ', icon: Clock },
    { id: 'answered', label: 'پاسخ داده شده', icon: CheckCircle },
    { id: 'closed', label: 'بسته شده', icon: CheckCircle },
  ];

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
                {conversation.customerInitial || 'م'}
              </span>
              <span className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full border-2 border-[rgba(9,22,18,0.8)] bg-[#5be0a8]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">{conversation.customerName || 'مشتری ناشناس'}</h3>
                <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs ${badge.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full text-xs flex-shrink-0 ${badge.dotColor}`} />
                  {badge.text}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {conversation.department || 'بدون دپارتمان'} · {conversation.customerPhone || 'نامشخص'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* دکمه تغییر وضعیت */}
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
                            isActive ? 'text-[#59D8C3]' : 'text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{option.label}</span>
                          {isActive && <span className="mr-auto text-[10px] text-[#59D8C3]">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* دکمه تخصیص برای مدیر کل و مدیر */}
            {(isAdmin || isManager) && assignableEmployees.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[rgba(89,216,195,0.08)] text-[#59D8C3] border border-[rgba(89,216,195,0.15)] hover:bg-[rgba(89,216,195,0.12)] transition-all"
                >
                  {conversation.assignee ? 'تغییر مسئول' : 'تخصیص'}
                </button>
                {showAssignDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-[#0D1B17] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="p-2 border-b border-[rgba(255,255,255,0.1)]">
                      <p className="text-xs text-gray-500">انتخاب مسئول جدید</p>
                    </div>
                    {assignableEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => handleAssign(emp.id)}
                        className={`w-full text-right px-4 py-2.5 text-sm hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center justify-between ${
                          conversation.assignee === emp.name ? 'text-[#59D8C3]' : 'text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>{emp.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{emp.tickets} گفتگو</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* دکمه بستن گفتگو */}
            {(isAdmin || isManager) && conversation.status !== 'closed' && (
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
            <p className="text-gray-500 text-xs mt-1">اولین پیام را شما ارسال کنید</p>
          </div>
        ) : (
          conversation.messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.isSupport ? "flex-row-reverse" : "flex-row"}`}>
              <div className="flex flex-col max-w-[85%]">
                <span className={`text-xs text-gray-500 mb-1 ${msg.isSupport ? "text-left" : "text-right"}`}>
                  {msg.senderName || (msg.isSupport ? 'پشتیبانی' : 'مشتری')}
                </span>
                <div className={`px-4 py-3 rounded-2xl ${
                  msg.isSupport
                    ? "bg-[rgba(89,216,195,0.12)] border border-[rgba(89,216,195,0.2)]"
                    : "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]"
                }`}>
                  <p className={`text-sm leading-relaxed ${msg.isSupport ? "text-[#59D8C3]" : "text-white"}`}>
                    {msg.text}
                  </p>
                </div>
                <span className={`text-[10px] text-gray-500 mt-1 ${msg.isSupport ? "text-left" : "text-right"}`}>
                  {msg.time || 'چند لحظه پیش'}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[rgba(255,255,255,0.1)] bg-[rgba(9,22,18,0.95)] p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              placeholder="پیام خود را بنویسید..."
              value={newMessage}
              onChange={(e) => onNewMessageChange(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
              style={{ maxHeight: "120px", minHeight: "48px" }}
              disabled={isSending}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-gray-500">
            Enter برای ارسال • Shift+Enter برای خط جدید
          </p>
          {conversation.status === 'closed' && (
            <span className="text-[10px] text-red-400">این گفتگو بسته شده است</span>
          )}
        </div>
      </div>
    </div>
  );
}