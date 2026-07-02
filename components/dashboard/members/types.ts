// components/dashboard/members/types.ts
export interface Member {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  role: "مدیر دپارتمان" | "کارمند";
  departmentId: number;
  departmentName: string;
  status: "active" | "inactive";
  presence: "online" | "offline";
  lastActivity: string;
  openTickets: number;
  avatar?: string;
  staffId?: number;
}

export interface Department {
  id: number;
  name: string;
}

export interface AgentResponse {
  id: number;
  venokStaffId: number;
  isActive: boolean;
  lastOnlineAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  venokStaff?: {
    id: number;
    name: string;
  };
  supportAgentTeams?: {
    id: number;
    agentId: number;
    teamId: number;
    role: string;
    createdAt: string;
    team?: {
      id: number;
      name: string;
      description: string;
      color: string;
      isActive: boolean;
    };
  }[];
}

export interface TeamResponse {
  id: number;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface StaffResponse {
  id: number;
  name: string;
  code: string;
  status: string;
  phone?: string;
  userId?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface StatsData {
  totalMembers: number;
  managersCount: number;
  activeMembersCount: number;
  inactiveMembersCount: number;
}