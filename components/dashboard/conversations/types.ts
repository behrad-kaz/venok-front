export interface Message {
  id: number;
  senderName: string;
  text: string;
  time: string;
  isSupport: boolean;
  isInternal?: boolean;
  senderType?: 'customer' | 'agent' | 'system';
  createdAt?: string;
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
  departmentId?: number;
  assignee: string;
  assigneeId?: number | null;
  source: string;
  startDate: string;
  priority?: "urgent";
  unreadCount?: number;
  messages: Message[];
  createdAt?: string;
  updatedAt?: string;
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

export interface AssignableEmployee {
  id: number;
  name: string;
  department: string;
  tickets: number;
}