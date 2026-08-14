// services/notificationApi.ts
import { api } from './api-client';

export interface Notification {
  id: string;
  type: 'warning' | 'info' | 'danger';
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  timestamp: Date | string;
  isRead: boolean;
  fingerprint?: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  unread: number;
}

export interface CreateNotificationPayload {
  title: string;
  description: string;
  type: 'warning' | 'info' | 'danger';
  recipientId: number;
  buttonText?: string;
  buttonLink?: string;
}

export const getNotifications = async (): Promise<NotificationResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return { notifications: [], total: 0, unread: 0 };
    }
    
    const response = await api.get<NotificationResponse>(`/notifications?token=${token}`);
    return response || { notifications: [], total: 0, unread: 0 };
  } catch (error) {
    console.error('❌ خطا در دریافت نوتیفیکیشن‌ها:', error);
    return { notifications: [], total: 0, unread: 0 };
  }
};

export const createNotification = async (payload: CreateNotificationPayload): Promise<Notification> => {
  try {
    const response = await api.post<Notification>('/notifications', payload);
    return response;
  } catch (error) {
    console.error('❌ خطا در ایجاد نوتیفیکیشن:', error);
    throw error;
  }
};