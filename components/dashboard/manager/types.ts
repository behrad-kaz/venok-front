// components/dashboard/manager/types.ts

export interface DepartmentStats {
  openTickets: number;
  waitingResponse: number;
  avgResponseTime: string;
  onlineMembers: number;
  totalMembers: number;
}

export interface AttentionItem {
  id: number;
  title: string;
  buttonText: string;
  buttonLink: string;
  type: "danger" | "warning" | "info" | "warning";
}

export interface QueueStatus {
  newTickets: number;
  inProgress: number;
  unassigned: number;
  closedToday: number;
}

export interface DepartmentMember {
  id: number;
  name: string;
  initial: string;
  status: "online" | "offline";
  openTickets: number;
  avgResponseTime: string;
  lastActivity: string;
  workStatus: "busy" | "normal";
  closedTickets?: number;
}

export interface RecentConversation {
  id: number;
  customerName: string;
  customerPhone: string;
  subject: string;
  assignee: string;
  status: "waiting" | "answered" | "open";
  lastActivity: string;
  isUrgent: boolean;
}

export interface TrendData {
  day: string;
  new: number;
  open: number;
  closed: number;
}