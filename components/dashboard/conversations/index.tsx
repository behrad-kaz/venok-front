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
import { authService } from '@/services/auth.service';
import { fetchStaffList } from '@/services/membersApi';

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
  const [isAssigning, setIsAssigning] = useState(false);
  const [userStaffInfo, setUserStaffInfo] = useState<{ id: number; departmentId: number | null; role: string; name: string } | null>(null);
  
  const isInitialized = useRef(false);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);

  const isAdmin = role === 'مدیر کل';
  const isManager = role === 'مدیر';

  const currentUser = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return authService.getStoredUserData();
  }, []);

  // ✅ اصلاح: دریافت دپارتمان از اطلاعات staff
  const userDepartment = useMemo(() => {
    if (typeof window === 'undefined') return '';
    if (isAdmin) return '';
    
    // ✅ اگر اطلاعات staff موجود است و departmentId دارد
    if (userStaffInfo?.departmentId) {
      // نام دپارتمان رو از assignableEmployees پیدا کن
      const foundDept = assignableEmployees.find(emp => emp.departmentId === userStaffInfo.departmentId);
      if (foundDept?.department) {
        console.log('📌 دپارتمان کاربر از assignableEmployees:', foundDept.department);
        return foundDept.department;
      }
      
      // یا از localStorage
      const dept = localStorage.getItem('userDepartment') || 
                   localStorage.getItem('departmentName') || 
                   '';
      console.log('📌 userDepartment از localStorage:', dept);
      return dept;
    }
    
    const dept = localStorage.getItem('userDepartment') || 
                 localStorage.getItem('departmentName') || 
                 '';
    console.log('📌 userDepartment (fallback):', dept);
    return dept;
  }, [isAdmin, userStaffInfo, assignableEmployees]);

  useEffect(() => {
    const fetchStaffInfo = async () => {
      if (isAdmin) {
        console.log('👑 مدیر کل: نیازی به staffId نیست');
        setUserStaffInfo({ id: 0, departmentId: null, role: 'admin', name: 'مدیر کل' });
        return;
      }

      try {
        const staffId = authService.getStaffId();
        if (!staffId) {
          console.warn('⚠️ staffId وجود ندارد');
          return;
        }
        
        const response = await api.get<{ id: number; departmentId: number | null; role: string; name: string }>(`/staff/${staffId}`);
        console.log('📌 اطلاعات staff از API:', response);
        setUserStaffInfo(response);
        
        // ✅ ذخیره دپارتمان در localStorage برای استفاده بعدی
        if (response.departmentId) {
          // برای دریافت نام دپارتمان، باید از لیست کارمندان استفاده کنیم
          // این کار بعد از بارگذاری assignableEmployees انجام میشه
        }
      } catch (error) {
        console.error('❌ خطا در دریافت اطلاعات staff:', error);
      }
    };
    
    fetchStaffInfo();
  }, [isAdmin]);

  const loadAssignableEmployees = useCallback(async () => {
  if (!isAdmin && !isManager) {
    console.log('ℹ️ کاربر نه مدیر کل است و نه مدیر دپارتمان، بارگذاری کارمندان skipped');
    return;
  }
  
  if (isLoadingRef.current) {
    console.log('⏳ در حال بارگذاری قبلی، صرف نظر...');
    return;
  }
  
  isLoadingRef.current = true;
  console.log('🔄 شروع بارگذاری کارمندان قابل تخصیص...');
  
  try {
    console.log('📤 ارسال درخواست به /staff...');
    const staffResponse = await api.get<any[]>('/staff');
    console.log('📥 پاسخ خام از API (staff):', staffResponse);
    
    let staffs = Array.isArray(staffResponse) ? staffResponse : (staffResponse?.data || []);
    
    console.log(`📡 ${staffs.length} کارمند از API دریافت شد`);
    
    // ✅ دریافت لیست گفتگوها برای محاسبه تعداد تیکت‌های هر کارمند
    console.log('📤 ارسال درخواست به /conversation برای محاسبه تعداد گفتگوها...');
    const convResponse = await api.get<{ data: any[] }>('/conversation');
    const conversations = convResponse.data || [];
    console.log(`📡 ${conversations.length} گفتگو برای محاسبه دریافت شد`);
    
    // ✅ محاسبه تعداد گفتگوهای باز برای هر کارمند
    const openConversationsCount: Record<number, number> = {};
    
    conversations.forEach((conv: any) => {
      // فقط گفتگوهای باز را در نظر بگیر (open, waiting, answered)
      if (conv.status !== 'closed' && conv.agentId) {
        const agentId = conv.agentId;
        openConversationsCount[agentId] = (openConversationsCount[agentId] || 0) + 1;
      }
    });
    
    console.log('📊 تعداد گفتگوهای باز هر کارمند:', openConversationsCount);
    
    // ✅ نگاشت به فرمت مورد نیاز با تعداد گفتگوها
    const mapped = staffs
      .filter((staff: any) => staff.deletedAt === null)
      .map((staff: any) => ({
        id: staff.id,
        name: staff.name,
        department: staff.department?.name || 'بدون دپارتمان',
        departmentId: staff.departmentId || null,
        tickets: openConversationsCount[staff.id] || 0,
        role: staff.role,
      }));
    
    console.log('✅ لیست کارمندان با تعداد گفتگو:', mapped);
    setAssignableEmployees(mapped);
    
    // ✅ اگر کاربر مدیر دپارتمان است و userStaffInfo دپارتمان دارد، name رو تنظیم کن
    if (isManager && userStaffInfo?.departmentId) {
      const userDept = mapped.find(emp => emp.departmentId === userStaffInfo.departmentId);
      if (userDept?.department) {
        localStorage.setItem('userDepartment', userDept.department);
        localStorage.setItem('departmentName', userDept.department);
        console.log(`✅ دپارتمان کاربر تنظیم شد: ${userDept.department}`);
      }
    }
    
  } catch (error) {
    console.error('❌ خطا در دریافت لیست کارمندان از API:', error);
    
    // ✅ اگر خطا خورد، از fetchStaffList استفاده کن
    try {
      console.log('🔄 تلاش با fetchStaffList...');
      const staffList = await fetchStaffList();
      console.log(`📡 ${staffList.length} کارمند از fetchStaffList دریافت شد`);
      
      // ✅ دریافت لیست گفتگوها برای محاسبه تعداد تیکت‌ها
      const convResponse = await api.get<{ data: any[] }>('/conversation');
      const conversations = convResponse.data || [];
      
      const openConversationsCount: Record<number, number> = {};
      conversations.forEach((conv: any) => {
        if (conv.status !== 'closed' && conv.agentId) {
          const agentId = conv.agentId;
          openConversationsCount[agentId] = (openConversationsCount[agentId] || 0) + 1;
        }
      });
      
      const mapped = staffList
        .filter((staff: any) => staff.deletedAt === null)
        .map((staff: any) => ({
          id: staff.id,
          name: staff.name,
          department: staff.department?.name || 'بدون دپارتمان',
          departmentId: staff.departmentId || null,
          tickets: openConversationsCount[staff.id] || 0,
          role: staff.role,
        }));
      
      console.log('✅ لیست کارمندان از fetchStaffList با تعداد گفتگو:', mapped);
      setAssignableEmployees(mapped);
      
      if (isManager && userStaffInfo?.departmentId) {
        const userDept = mapped.find(emp => emp.departmentId === userStaffInfo.departmentId);
        if (userDept?.department) {
          localStorage.setItem('userDepartment', userDept.department);
          localStorage.setItem('departmentName', userDept.department);
        }
      }
    } catch (fallbackError) {
      console.error('❌ خطا در fetchStaffList:', fallbackError);
      setAssignableEmployees([]);
    }
  } finally {
    isLoadingRef.current = false;
  }
}, [isAdmin, isManager, userStaffInfo]);

  const loadConversations = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    
    try {
      setIsLoading(true);
      console.log('📡 دریافت لیست گفتگوها از API...');
      
      const response = await api.get<{ data: any[] }>('/conversation');
      let convs = response.data || [];
      
      console.log(`✅ ${convs.length} گفتگو از API دریافت شد`);
      
      if (isAdmin) {
        console.log('👑 مدیر کل: نمایش همه گفتگوها');
      } else {
        const staffId = authService.getStaffId();
        const departmentId = userStaffInfo?.departmentId || null;
        
        console.log('📌 staffId کاربر:', staffId);
        console.log('📌 departmentId کاربر:', departmentId);
        console.log('📌 نقش کاربر:', role);
        
        if (role === 'کارمند') {
          if (staffId) {
            convs = convs.filter((conv: any) => conv.agentId === staffId);
            console.log(`👤 کارمند با staffId ${staffId}: ${convs.length} گفتگو`);
          } else {
            console.warn('⚠️ staffId برای کارمند یافت نشد');
            convs = [];
          }
        } else if (role === 'مدیر') {
          if (departmentId) {
            convs = convs.filter((conv: any) => conv.teamId === departmentId);
            console.log(`👔 مدیر دپارتمان (departmentId: ${departmentId}): ${convs.length} گفتگو`);
          } else {
            console.warn('⚠️ departmentId برای مدیر یافت نشد');
            convs = [];
          }
        }
      }
      
      const formatted = convs.map((conv: any) => {
        const customerName = conv.customer?.name || conv.customerName || 'مشتری ناشناس';
        
        return {
          id: conv.id,
          customerName: customerName,
          customerId: conv.customer?.id || conv.customerId || null,
          customer: conv.customer || null,
          customerInitial: customerName.charAt(0) || 'م',
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
          messages: (conv.messages || [])
            .slice()
            .sort((a: any, b: any) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateA - dateB;
            })
            .map((msg: any) => ({
              id: msg.id,
              senderName: msg.senderName || (msg.senderType === 'customer' ? 'مشتری' : 'پشتیبانی'),
              text: msg.content,
              time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('fa-IR') : '',
              isSupport: msg.senderType === 'agent' || msg.senderType === 'support' || msg.senderType === 'admin',
              isInternal: msg.isInternalNote || false,
              senderType: msg.senderType || 'customer',
              senderId: msg.senderId ?? null,
              fileUrl: msg.fileUrl || null,
              fileType: msg.fileType || null,
              createdAt: msg.createdAt,
            })),
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        };
      });
      
      console.log(`📋 ${formatted.length} گفتگو فرمت شد`);
      setConversations(formatted);
      
      if (formatted.length > 0 && !selectedConversation) {
        setSelectedConversation(formatted[0]);
      }
      
    } catch (error) {
      console.error('❌ خطا در دریافت گفتگوها:', error);
      showError('خطا در بارگذاری گفتگوها');
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [selectedConversation, showError, role, userStaffInfo, isAdmin]);

  // ✅ اصلاح useEffect برای اطمینان از بارگذاری
  useEffect(() => {
    console.log('🔄 useEffect - isAdmin:', isAdmin, 'userStaffInfo:', userStaffInfo, 'isInitialized:', isInitialized.current);
    
    if (isAdmin) {
      if (!isInitialized.current) {
        isInitialized.current = true;
        console.log('🚀 بارگذاری اولیه برای مدیر کل...');
        (async () => {
          try {
            await loadConversations();
            await loadAssignableEmployees();
            console.log('✅ بارگذاری اولیه برای مدیر کل کامل شد');
          } catch (error) {
            console.error('❌ خطا در بارگذاری اولیه:', error);
          }
        })();
      }
      return;
    }

    if (userStaffInfo !== null && !isInitialized.current) {
      isInitialized.current = true;
      console.log('🚀 بارگذاری اولیه برای کاربر...');
      (async () => {
        try {
          await loadConversations();
          await loadAssignableEmployees();
          console.log('✅ بارگذاری اولیه برای کاربر کامل شد');
        } catch (error) {
          console.error('❌ خطا در بارگذاری اولیه:', error);
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

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      if (activeFilter !== 'all' && conv.status !== activeFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = conv.customerName?.toLowerCase().includes(query) || false;
        const matchSubject = conv.subject?.toLowerCase().includes(query) || false;
        const matchPhone = conv.customerPhone?.includes(query) || false;
        const matchAssignee = conv.assignee?.toLowerCase().includes(query) || false;
        const matchDepartment = conv.department?.toLowerCase().includes(query) || false;
        if (!matchName && !matchSubject && !matchPhone && !matchAssignee && !matchDepartment) return false;
      }
      return true;
    });
  }, [conversations, activeFilter, searchQuery]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!selectedConversation || !message.trim() || isSending) return;
    
    setIsSending(true);
    
    try {
      console.log(`📤 ارسال پیام به گفتگو ${selectedConversation.id}:`, message);
      
      await api.post(`/conversation/${selectedConversation.id}/message`, {
        content: message,
        isInternalNote: false,
      });
      
      const newMsg = {
        id: Date.now(),
        senderName: currentUser?.userName || 'شما',
        text: message,
        time: new Date().toLocaleTimeString('fa-IR'),
        isSupport: true,
        isInternal: false,
        senderType: 'agent',
        senderId: currentUser?.staffId || null,
        createdAt: new Date().toISOString(),
      };
      
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversation.id) {
          const updatedMessages = [...conv.messages, newMsg]
            .sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateA - dateB;
            });
          
          return {
            ...conv,
            messages: updatedMessages,
            lastMessage: message,
            time: 'همین الان',
          };
        }
        return conv;
      }));
      
      setSelectedConversation(prev => {
        if (!prev) return prev;
        const updatedMessages = [...prev.messages, newMsg]
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateA - dateB;
          });
        
        return {
          ...prev,
          messages: updatedMessages,
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
  }, [selectedConversation, isSending, showSuccess, showError, currentUser]);

  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowDetails(false);
    if (layoutMode === 'mobile' || layoutMode === 'tablet') {
      setViewMode('chat');
    }
  }, [layoutMode]);

  const handleAssignConversation = useCallback(async (staffId: number) => {
    if (!selectedConversation) return;
    
    setIsAssigning(true);
    
    try {
      console.log(`📤 تخصیص گفتگو ${selectedConversation.id} به کارمند ${staffId}`);
      
      await api.patch(`/conversation/${selectedConversation.id}`, {
        agentId: staffId,
      });
      
      const assignedStaff = assignableEmployees.find(emp => emp.id === staffId);
      
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            assignee: assignedStaff?.name || '',
            assigneeId: staffId,
          };
        }
        return conv;
      }));
      
      setSelectedConversation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          assignee: assignedStaff?.name || '',
          assigneeId: staffId,
        };
      });
      
      showSuccess(`گفتگو با موفقیت به ${assignedStaff?.name || 'کارمند'} تخصیص داده شد`);
      
    } catch (error) {
      console.error('❌ خطا در تخصیص گفتگو:', error);
      showError('خطا در تخصیص گفتگو');
    } finally {
      setIsAssigning(false);
    }
  }, [selectedConversation, assignableEmployees, showSuccess, showError]);

  const handleChangeStatus = useCallback(async (status: string) => {
    if (!selectedConversation) return;
    
    try {
      console.log(`📤 تغییر وضعیت گفتگو ${selectedConversation.id} به ${status}`);
      
      await api.patch(`/conversation/${selectedConversation.id}`, {
        status: status,
      });
      
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            status: status as any,
          };
        }
        return conv;
      }));
      
      setSelectedConversation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: status as any,
        };
      });
      
      const statusLabels: Record<string, string> = {
        open: 'باز',
        waiting: 'در انتظار پاسخ',
        answered: 'پاسخ داده شده',
        closed: 'بسته شده',
      };
      showSuccess(`وضعیت گفتگو به "${statusLabels[status] || status}" تغییر یافت`);
      
    } catch (error) {
      console.error('❌ خطا در تغییر وضعیت:', error);
      showError('خطا در تغییر وضعیت گفتگو');
    }
  }, [selectedConversation, showSuccess, showError]);

  const handleCloseConversation = useCallback(async () => {
    if (!selectedConversation) return;
    
    showConfirm(
      `آیا از بستن گفتگو با "${selectedConversation.customerName}" مطمئن هستید؟`,
      'تایید بستن گفتگو',
      async () => {
        try {
          await api.patch(`/conversation/${selectedConversation.id}`, {
            status: 'closed',
          });
          
          setConversations(prev => prev.map(conv => {
            if (conv.id === selectedConversation.id) {
              return {
                ...conv,
                status: 'closed',
              };
            }
            return conv;
          }));
          
          setSelectedConversation(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              status: 'closed',
            };
          });
          
          showSuccess(`گفتگو با ${selectedConversation.customerName} با موفقیت بسته شد`);
          
        } catch (error) {
          console.error('❌ خطا در بستن گفتگو:', error);
          showError('خطا در بستن گفتگو');
        }
      }
    );
  }, [selectedConversation, showConfirm, showSuccess, showError]);

  useEffect(() => {
    const checkLayout = () => {
      const width = window.innerWidth;
      if (width < 768) setLayoutMode('mobile');
      else if (width < 1024) setLayoutMode('tablet');
      else setLayoutMode('desktop');
    };
    checkLayout();
    window.addEventListener('resize', checkLayout);
    return () => window.removeEventListener('resize', checkLayout);
  }, []);

  const handleBackToList = useCallback(() => {
    if (layoutMode === 'mobile' || layoutMode === 'tablet') {
      setViewMode('list');
      setShowDetails(false);
    }
  }, [layoutMode]);

  const handleBackToChat = useCallback(() => {
    if ((layoutMode === 'mobile' || layoutMode === 'tablet') && showDetails) {
      setShowDetails(false);
      setViewMode('chat');
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

  // ========== حالت دسکتاپ ==========
  if (layoutMode === 'desktop') {
    return (
      <div className="flex h-[calc(100vh-120px)] gap-4 ">
        <div className={`${showDetails ? 'w-[300px]' : 'w-[360px]'} flex-shrink-0 transition-all duration-300 h-full`}>
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
              onChangeStatus={() => handleChangeStatus(selectedConversation.status === 'closed' ? 'open' : 'closed')}
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

  // ========== حالت تبلت ==========
  if (layoutMode === 'tablet') {
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
          {viewMode === 'chat' && selectedConversation && (
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
            />
          )}

          {viewMode === 'details' && selectedConversation && (
            <ConversationDetails
              conversation={selectedConversation}
              onClose={() => setShowDetails(false)}
              onChangeStatus={() => handleChangeStatus(selectedConversation.status === 'closed' ? 'open' : 'closed')}
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

  // ========== حالت موبایل ==========
  return (
    <div className="h-[calc(100vh-120px)]">
      {viewMode === 'list' && (
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

      {viewMode === 'chat' && selectedConversation && (
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
        />
      )}

      {viewMode === 'details' && selectedConversation && (
        <ConversationDetails
          conversation={selectedConversation}
          onClose={() => setShowDetails(false)}
          onChangeStatus={() => handleChangeStatus(selectedConversation.status === 'closed' ? 'open' : 'closed')}
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