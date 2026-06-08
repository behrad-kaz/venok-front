// components/dashboard/departments/types.ts
export interface Department {
  id: number;
  name: string;
  manager: string;
  managerAvatar?: string;
  description: string;
  status: "active" | "inactive";
  memberCount: number;
  openTickets: number;
  avgResponseTime: string;
  color: string;
  statusType: "normal" | "busy" | "attention";
}