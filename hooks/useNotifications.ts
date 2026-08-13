// hooks/useNotifications.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { getNotifications, Notification } from '@/services/notificationApi';

const NOTIFICATIONS_STORAGE_KEY = 'dashboard_notifications';
const UNREAD_COUNT_KEY = 'dashboard_unread_count';
const NOTIFICATIONS_TIMESTAMP_KEY = 'dashboard_notifications_timestamp';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const saveNotificationsToStorage = (notifications: Notification[]) => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    const unread = notifications.filter(n => !n.isRead).length;
    localStorage.setItem(UNREAD_COUNT_KEY, String(unread));
    localStorage.setItem(NOTIFICATIONS_TIMESTAMP_KEY, String(Date.now()));
  } catch (error) {
    console.error('❌ خطا در ذخیره نوتیفیکیشن:', error);
  }
};

const loadNotificationsFromStorage = (): Notification[] => {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.map((n: any) => ({
        ...n,
        timestamp: n.timestamp ? new Date(n.timestamp) : new Date(),
      }));
    }
  } catch (error) {
    console.error('❌ خطا در بارگذاری نوتیفیکیشن:', error);
  }
  return [];
};

const ensureDate = (timestamp: any): Date => {
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp);
  if (typeof timestamp === 'number') return new Date(timestamp);
  return new Date();
};

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    return loadNotificationsFromStorage();
  });
  
  const [unreadCount, setUnreadCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem(UNREAD_COUNT_KEY) || '0', 10);
    } catch {
      return 0;
    }
  });
  
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isComponentMounted = useRef(true);
  const isFetchingRef = useRef(false);
  const pollInterval = 5000; // ✅ ۵ ثانیه برای تعادل بین سرعت و عملکرد

  const mergeNotifications = useCallback((newNotifications: Notification[]): Notification[] => {
    const existingNotifications = loadNotificationsFromStorage();
    const existingMap = new Map<string, Notification>();
    existingNotifications.forEach(n => existingMap.set(n.id, n));
    
    const newMap = new Map<string, Notification>();
    newNotifications.forEach(n => newMap.set(n.id, n));
    
    const merged: Notification[] = [];
    const allIds = new Set([...existingMap.keys(), ...newMap.keys()]);
    
    allIds.forEach(id => {
      const existing = existingMap.get(id);
      const newNotif = newMap.get(id);
      
      if (newNotif) {
        const timestamp = ensureDate(newNotif.timestamp);
        merged.push({
          ...newNotif,
          timestamp,
          isRead: existing?.isRead ?? newNotif.isRead,
        });
      } else if (existing) {
        merged.push(existing);
      }
    });
    
    merged.sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
    
    const seen = new Set<string>();
    const uniqueMerged = merged.filter(n => {
      if (!n.fingerprint) return true;
      if (seen.has(n.fingerprint)) return false;
      seen.add(n.fingerprint);
      return true;
    });
    
    return uniqueMerged;
  }, []);

  const updateNotifications = useCallback((newNotifications: Notification[]) => {
    const merged = mergeNotifications(newNotifications);
    
    // ✅ فقط در صورت تغییر واقعی، state را به‌روز کن
    setNotifications(prev => {
      const prevStr = JSON.stringify(prev.map(n => ({ id: n.id, isRead: n.isRead })));
      const newStr = JSON.stringify(merged.map(n => ({ id: n.id, isRead: n.isRead })));
      if (prevStr === newStr && prev.length === merged.length) {
        return prev; // تغییری نکرده
      }
      return merged;
    });
    
    const unread = merged.filter(n => !n.isRead).length;
    setUnreadCount(unread);
    setTotalCount(merged.length);
    saveNotificationsToStorage(merged);
  }, [mergeNotifications]);

  const fetchNotifications = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    
    if (!isComponentMounted.current) {
      isFetchingRef.current = false;
      return;
    }
    
    try {
      const data = await getNotifications();
      
      if (isComponentMounted.current) {
        // ✅ استفاده از requestAnimationFrame برای همگام‌سازی با رندر
        requestAnimationFrame(() => {
          if (isComponentMounted.current) {
            updateNotifications(data.notifications || []);
            setIsLoading(false);
          }
        });
      }
    } catch (err) {
      if (isComponentMounted.current) {
        requestAnimationFrame(() => {
          if (isComponentMounted.current) {
            setError(err instanceof Error ? err.message : 'خطا در دریافت نوتیفیکیشن‌ها');
            setIsLoading(false);
          }
        });
        console.error('❌ خطا در دریافت نوتیفیکیشن‌ها:', err);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [updateNotifications]);

  useEffect(() => {
    isComponentMounted.current = true;
    
    // بارگذاری اولیه
    fetchNotifications();
    
    // شروع Polling
    intervalRef.current = setInterval(() => {
      fetchNotifications();
    }, pollInterval);
    
    return () => {
      isComponentMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isFetchingRef.current = false;
    };
  }, [fetchNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      );
      saveNotificationsToStorage(updated);
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      saveNotificationsToStorage(updated);
      return updated;
    });
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    totalCount,
    isLoading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}