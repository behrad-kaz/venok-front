// components/dashboard/reports/types.ts
export interface DepartmentPerformance {
  id: number;
  name: string;
  totalTickets: number;
  openTickets: number;
  avgFirstResponse: string;
  resolutionRate: number;
  status: "good" | "normal" | "attention";
}

export interface MemberPerformance {
  id: number;
  name: string;
  initials: string;
  department: string;
  answeredTickets: number;
  avgResponseTime: string;
  openTickets: number;
  lastActivity: string;
  status: "active" | "inactive";
}

export interface TrendData {
  day: string;
  new: number;
  solved: number;
}