'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useModal } from '@/components/ui/modal';
import { Conversation, AssignableEmployee } from './types';
import ConversationList from './ConversationList';
import ConversationChat from './ConversationChat';
import ConversationDetails from './ConversationDetails';
import { useRoleStore } from '@/stores/useRoleStore';
import { api } from '@/services/api-client';

type ViewMode = 'list' | 'chat' | 'details';
type LayoutMode = 'desktop' | 'tablet' | 'mobile';

export default function ConversationsContainer() {
  const { role } = useRoleStore();
  const { showSuccess, showInfo, showWarning, showError, showConfirm } = useModal();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [assignableEmployees, setAssignableEmployees] = useState<AssignableEmployee[]>([]);
  
  const isInitialized = useRef(false);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  // دریافت لیست گفتگوها از API
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('📡 دریافت لیست گفتگوها از API...');
      
      const response = await api.get<{ data: Conversation[] }>('/conversation');
      const convs = response.data || [];
      
      console.log(`✅ ${convs.length} گفتگو دریافت شد`);
      
      // تبدیل داده‌ها به فرمت مورد نظر
      const formatted = convs.map((conv: any) => ({
        id: conv.id,
        customerName: conv.customerName || 'مشتری ناشناس',
        customerInitial: conv.customerName?.charAt(0) || 'م',
        customerPhone: conv.customerPhone || 'نامشخص',
        subject: conv.subject || 'بدون موضوع',
        lastMessage: conv.messages?.[conv.messages.length - 1]?.content || 'بدون پیام',
        time: conv.lastActivity ? new Date(conv.lastActivity).toLocaleString('fa-IR') : 'چند لحظه پیش',
        status: conv.status || 'open',
        department: conv.team?.name || 'بدون دپارتمان',
        departmentId: conv.teamId || conv.team?.id || null,
        assignee: conv.agent?.name || '',
        assigneeId: conv.agentId || conv.agent?.id || null,
        source: conv.source || 'ویجت سایت',
        startDate: conv.createdAt ? new Date(conv.createdAt).toLocaleDateString('fa-IR') : '',
        priority: conv.priority || 'normal',
        unreadCount: conv.unreadCount || 0,
        messages: conv.messages?.map((msg: any) => ({
          id: msg.id,
          senderName: msg.senderName || (msg.senderType === 'customer' ? 'مشتری' : 'پشتیبانی'),
          text: msg.content,
          time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('fa-IR') : '',
          isSupport: msg.senderType === 'agent' || msg.senderType === 'support' || msg.senderType === 'admin',
          isInternal: msg.isInternalNote || false,
          senderType: msg.senderType,
          createdAt: msg.createdAt,
        })) || [],
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      }));
      
      setConversations(formatted);
      
      // اگر گفتگویی انتخاب نشده و لیست خالی نیست، اولین گفتگو را انتخاب کن
      if (formatted.length > 0 && !selectedConversation) {
        setSelectedConversation(formatted[0]);
      }
      
    } catch (error) {
      console.error('❌ خطا در دریافت گفتگوها:', error);
      showError('خطا در بارگذاری گفتگوها');
    } finally {
      setIsLoading(false);
    }
  }, [selectedConversation, showError]);

  // بارگذاری اولیه
  useEffect(() => {
    loadConversations();
    
    // بارگذاری مجدد هر 30 ثانیه
    refreshInterval.current = setInterval(() => {
      loadConversations();
    }, 30000);
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [loadConversations]);

  // محاسبه فیلترها
  const filters = useMemo(() => {
    const counts = {
      all: conversations.length,
      open: conversations.filter(c => c.status === 'open').length,
      waiting: conversations.filter(c => c.status === 'waiting').length,
      answered: conversations.filter(c => c.status === 'answered').length,
      closed: conversations.filter(c => c.status === 'closed').length,
    };
    return [
      { id: 'all', label: 'همه', count: counts.all },
      { id: 'open', label: 'باز', count: counts.open },
      { id: 'waiting', label: 'در انتظار', count: counts.waiting },
      { id: 'answered', label: 'پاسخ داده شده', count: counts.answered },
      { id: 'closed', label: 'بسته شده', count: counts.closed },
    ];
  }, [conversations]);

  // فیلتر کردن گفتگوها
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      if (activeFilter !== 'all' && conv.status !== activeFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = conv.customerName?.toLowerCase().includes(query) || false;
        const matchSubject = conv.subject?.toLowerCase().includes(query) || false;
        const matchPhone = conv.customerPhone?.includes(query) || false;
        if (!matchName && !matchSubject && !matchPhone) return false;
      }
      return true;
    });
  }, [conversations, activeFilter, searchQuery]);

  // ارسال پیام
  const handleSendMessage = useCallback(async (message: string) => {
    if (!selectedConversation || !message.trim() || isSending) return;
    
    setIsSending(true);
    
    try {
      console.log(`📤 ارسال پیام به گفتگو ${selectedConversation.id}:`, message);
      
      await api.post(`/conversation/${selectedConversation.id}/message`, {
        content: message,
        isInternalNote: false,
      });
      
      // به‌روزرسانی UI
      const newMsg = {
        id: Date.now(),
        senderName: 'شما',
        text: message,
        time: new Date().toLocaleTimeString('fa-IR'),
        isSupport: true,
        isInternal: false,
        senderType: 'agent',
        createdAt: new Date().toISOString(),
      };
      
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            messages: [...conv.messages, newMsg],
            lastMessage: message,
            time: 'همین الان',
          };
        }
        return conv;
      }));
      
      setSelectedConversation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, newMsg],
          lastMessage: message,
          time: 'همین الان',
        };
      });
      
      setNewMessage('');
      showSuccess('پیام با موفقیت ارسال شد');
      
    } catch (error) {
      console.error('❌ خطا در ارسال پیام:', error);
      showError('خطا در ارسال پیام');
    } finally {
      setIsSending(false);
    }
  }, [selectedConversation, isSending, showSuccess, showError]);

  // انتخاب گفتگو
  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowDetails(false);
    if (layoutMode === 'mobile' || layoutMode === 'tablet') {
      setViewMode('chat');
    }
  }, [layoutMode]);

  // ... بقیه کد

  return (
    <div className="h-[calc(100vh-160px)]">
      <div className="flex h-full gap-4">
        <div className={`${showDetails ? 'w-[300px]' : 'w-[360px]'} flex-shrink-0 transition-all duration-300`}>
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
          />
        </div>

        <div className="flex-1 transition-all duration-300">
          {selectedConversation ? (
            <ConversationChat
              conversation={selectedConversation}
              newMessage={newMessage}
              showDetails={showDetails}
              onNewMessageChange={setNewMessage}
              onSendMessage={handleSendMessage}
              onToggleDetails={() => setShowDetails(!showDetails)}
              onBack={() => {}}
              isMobile={false}
              role={role}
              assignableEmployees={assignableEmployees}
            />
          ) : (
            <div className="h-full flex items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">گفتگویی را انتخاب کنید</p>
                {isLoading && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 text-[#59D8C3] animate-spin" />
                    <span className="text-xs text-gray-500">در حال بارگذاری...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {showDetails && selectedConversation && (
          <div className="w-[320px] flex-shrink-0 transition-all duration-300">
            <ConversationDetails
              conversation={selectedConversation}
              onClose={() => setShowDetails(false)}
              onChangeStatus={() => {}}
              onAssign={() => {}}
              onCloseConversation={() => {}}
              role={role}
            />
          </div>
        )}
      </div>
    </div>
  );
}