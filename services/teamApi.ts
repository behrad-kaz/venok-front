// services/teamApi.ts
import { api } from './api-client';

export interface CreateTeamDto {
  name: string;
  description: string;
  color: string;
  isActive: boolean;
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
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
  memberCount?: number;
  managerName?: string | null;
  openConversations?: number;
  operationalStatus?: string;
  lastActivity?: string;
  supportAgentTeams?: {
    id: number;
    agentId: number;
    teamId: number;
    role: string;
    createdAt: string;
    agent?: {
      id: number;
      venokStaffId: number;
      isActive: boolean;
      lastOnlineAt: string | null;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
      venokStaff?: {
        id: number;
        coreStaffId: number;
        name: string;
        createdAt: string;
        updatedAt: string;
        deletedAt: string | null;
      };
    };
  }[];
}

const generateRandomColor = (): string => {
  const colors = [
    '#59D8C3', '#FF6B6B', '#F2B84B', '#8B7FDF', 
    '#4DABF7', '#FF9F43', '#00D2D3', '#A29BFE',
    '#FD79A8', '#00B894', '#E17055', '#74B9FF'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const createTeam = async (
  data: Omit<CreateTeamDto, 'color'>
): Promise<TeamResponse> => {
  const requestBody: CreateTeamDto = {
    ...data,
    color: generateRandomColor(),
  };

  console.log('📤 ارسال به سرور (POST /support/team):', requestBody);

  return api.post<TeamResponse>('/support/team', requestBody);
};

export const getTeams = async (status?: 'active' | 'inactive'): Promise<TeamResponse[]> => {
  const query = status ? `?status=${status}` : '';
  console.log(`📤 دریافت همه تیم‌ها (GET /support/team${query})`);

  return api.get<TeamResponse[]>(`/support/team${query}`);
};

export const getTeamById = async (id: number): Promise<TeamResponse | null> => {
  try {
    console.log(`📤 دریافت تیم با ID: ${id} (GET /support/team/${id})`);
    return await api.get<TeamResponse>(`/support/team/${id}`);
  } catch (error: any) {
    if (error?.message?.includes('404') || error?.status === 404) {
      console.log(`⚠️ تیم با ID ${id} یافت نشد (404)`);
      return null;
    }
    throw error;
  }
};

export const updateTeam = async (
  id: number,
  data: UpdateTeamDto
): Promise<TeamResponse> => {
  console.log(`📤 به‌روزرسانی تیم با ID: ${id} (PATCH /support/team/${id})`, data);

  return api.patch<TeamResponse>(`/support/team/${id}`, data);
};

export const deleteTeam = async (id: number): Promise<boolean> => {
  console.log(`📤 حذف تیم با ID: ${id} (DELETE /support/team/${id})`);

  await api.delete<void>(`/support/team/${id}`);
  return true;
};