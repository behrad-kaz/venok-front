// components/dashboard/conversations/types.ts

export interface Message {
  id: number;
  senderName: string;
  text: string;
  time: string;
  isSupport: boolean;
}

export interface Conversation {
  id: number;
  customerName: string;
  customerInitial: string;
  customerPhone: string;
  subject: string;
  lastMessage: string;
  time: string;
  status: "waiting" | "answered" | "open" | "closed";
  department: string;
  assignee: string;
  source: string;
  startDate: string;
  priority?: "urgent";
  unreadCount?: number;
  messages: Message[];
}

export interface StatusBadge {
  text: string;
  color: string;
  dotColor: string;
}

export interface StatusFilter {
  id: string;
  label: string;
  count: number;
}