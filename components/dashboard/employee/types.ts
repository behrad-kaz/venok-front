// components/dashboard/employee/types.ts

export interface Message {
  id: number;
  senderName: string;
  text: string;
  time: string;
  isSupport: boolean;
  isInternalNote?: boolean;
}

export interface Conversation {
  id: number;
  customerName: string;
  customerPhone: string;
  customerInitial: string;
  subject: string;
  lastMessage: string;
  time: string;
  status: "waiting" | "answered" | "open" | "closed";
  department: string;
  assignee: string;
  source: string;
  startDate: string;
  lastActivity: string;
  unreadCount?: number;
  isUrgent?: boolean;
  messages: Message[];
}

export interface StatusConfig {
  label: string;
  color: string;
  dotColor: string;
}