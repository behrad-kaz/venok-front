// components/dashboard/members/api/membersApi.ts
import { AgentResponse, TeamResponse, StaffResponse } from "../types";

const API_URL = 'http://localhost:3000';

// ✅ تابع دریافت هدرها با رفرش خودکار توکن (با استفاده از apiClient)
// دیگر نیازی به تابع جداگانه نیست چون apiClient خودش مدیریت می‌کند

export const fetchTeams = async (): Promise<TeamResponse[]> => {
  try {
    const response = await api.get<TeamResponse[]>('/support/team');
    return response.filter((team: TeamResponse) => team.deletedAt === null);
  } catch (error) {
    console.error('❌ خطا در دریافت تیم‌ها:', error);
    return [];
  }
};

export const fetchAgents = async (): Promise<AgentResponse[]> => {
  try {
    const response = await api.get<AgentResponse[]>('/support/agent');
    return response.filter((agent: AgentResponse) => agent.deletedAt === null);
  } catch (error) {
    console.error('❌ خطا در دریافت اپراتورها:', error);
    return [];
  }
};

export const fetchStaff = async (venokStaffId: number): Promise<StaffResponse | null> => {
  try {
    return await api.get<StaffResponse>(`/staff/${venokStaffId}`);
  } catch (error: any) {
    if (error?.message?.includes('404')) {
      console.log(`ℹ️ Staff با venokStaffId ${venokStaffId} یافت نشد (404)`);
    } else {
      console.error(`❌ خطا در دریافت staff ${venokStaffId}:`, error);
    }
    return null;
  }
};

export const getStaffCount = async (): Promise<number> => {
  try {
    const response = await api.get<{ id: number }>('/staff/me');
    return response.id || 1;
  } catch (error) {
    console.warn('⚠️ خطا در دریافت تعداد staff:', error);
    return 1;
  }
};

export const createStaff = async (name: string, code: string): Promise<StaffResponse> => {
  const staffData = {
    staff: {
      name: name,
      code: code,
    },
    user: {
      otpChannel: "sms",
      otpRes: "string",
    },
    panelType: "erp"
  };
  
  return api.post<StaffResponse>('/staff', staffData);
};

export const createAgent = async (
  venokStaffId: number,
  staffName: string
): Promise<AgentResponse> => {
  const agentData = {
    venokStaffId: venokStaffId,
    coreStaffId: venokStaffId,
    staffName: staffName,
    isActive: true,
  };

  return api.post<AgentResponse>('/support/agent', agentData);
};

export const assignAgentToTeam = async (agentId: number, teamId: number, role: string): Promise<void> => {
  const assignData = {
    teamId: teamId,
    role: role === "مدیر دپارتمان" ? "lead" : "member",
  };
  
  await api.post<void>(`/support/agent/${agentId}/team`, assignData);
};

export const updateAgent = async (agentId: number, isActive: boolean): Promise<void> => {
  const updateData = {
    isActive: isActive,
  };
  
  await api.patch<void>(`/support/agent/${agentId}`, updateData);
};

export const deleteAgent = async (agentId: number): Promise<void> => {
  try {
    await api.delete<void>(`/support/agent/${agentId}`);
  } catch (error: any) {
    if (error?.message?.includes('404')) {
      console.log(`⚠️ اپراتور ${agentId} قبلاً حذف شده است`);
      return;
    }
    throw error;
  }
};

export const deleteStaff = async (staffId: number): Promise<void> => {
  try {
    await api.delete<void>(`/staff/${staffId}`);
  } catch (error: any) {
    if (error?.message?.includes('404')) {
      console.log(`⚠️ staff ${staffId} قبلاً حذف شده است`);
      return;
    }
    console.warn(`⚠️ خطا در حذف staff:`, error);
  }
};

export const updateStaff = async (staffId: number, code: string): Promise<void> => {
  await api.patch<void>(`/staff/${staffId}`, { code });
};