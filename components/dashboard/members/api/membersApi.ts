// components/dashboard/members/api/membersApi.ts
import { AgentResponse, TeamResponse, StaffResponse } from "../types";

const API_URL = 'http://localhost:3001';
const SUPPORT_API_URL = 'http://localhost:3004';

// ✅ export کردن تابع getHeadersWithRefresh
export const getHeadersWithRefresh = async (): Promise<Record<string, string>> => {
  let accessToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const refreshToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  const contextToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('contextToken') : null;
  
  if (!accessToken && refreshToken) {
    try {
      const response = await fetch(`${API_URL}/auth/user/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        accessToken = data.accessToken;
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('userToken', accessToken);
        }
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
      }
    } catch (error) {
      console.error('❌ خطا در رفرش توکن:', error);
    }
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  if (contextToken) {
    headers['x-context-token'] = contextToken;
  }
  
  return headers;
};

const safeJson = async <T,>(response: Response): Promise<T | null> => {
  try {
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};

export const fetchTeams = async (): Promise<TeamResponse[]> => {
  try {
    const headers = await getHeadersWithRefresh();
    if (!headers.Authorization) return [];
    
    const response = await fetch(`${SUPPORT_API_URL}/support/team`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('isLoggedIn');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      return [];
    }
    
    const data = await safeJson<TeamResponse[]>(response);
    if (!data || !Array.isArray(data)) return [];
    
    return data.filter((team: TeamResponse) => team.deletedAt === null);
  } catch (error) {
    console.error('❌ خطا در دریافت تیم‌ها:', error);
    return [];
  }
};

export const fetchAgents = async (): Promise<AgentResponse[]> => {
  try {
    const headers = await getHeadersWithRefresh();
    if (!headers.Authorization) return [];
    
    const response = await fetch(`${SUPPORT_API_URL}/support/agent`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('isLoggedIn');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      return [];
    }
    
    const data = await safeJson<AgentResponse[]>(response);
    if (!data || !Array.isArray(data)) return [];
    
    return data.filter((agent: AgentResponse) => agent.deletedAt === null);
  } catch (error) {
    console.error('❌ خطا در دریافت اپراتورها:', error);
    return [];
  }
};

export const fetchStaff = async (venokStaffId: number): Promise<StaffResponse | null> => {
  try {
    const headers = await getHeadersWithRefresh();
    if (!headers.Authorization) return null;
    
    const response = await fetch(`${API_URL}/staff/${venokStaffId}`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`ℹ️ Staff با venokStaffId ${venokStaffId} یافت نشد (404)`);
      }
      return null;
    }
    
    return await safeJson<StaffResponse>(response);
  } catch (error) {
    console.error(`❌ خطا در دریافت staff ${venokStaffId}:`, error);
    return null;
  }
};

export const getStaffCount = async (): Promise<number> => {
  try {
    const headers = await getHeadersWithRefresh();
    if (!headers.Authorization) return 1;
    
    const response = await fetch(`${API_URL}/staff/me`, {
      method: 'GET',
      headers,
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.id || 1;
    }
    return 1;
  } catch (error) {
    console.warn('⚠️ خطا در دریافت تعداد staff:', error);
    return 1;
  }
};

export const createStaff = async (name: string, code: string): Promise<StaffResponse> => {
  const headers = await getHeadersWithRefresh();
  if (!headers.Authorization) {
    throw new Error('توکن معتبر یافت نشد');
  }
  
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
  
  const response = await fetch(`${API_URL}/staff`, {
    method: 'POST',
    headers,
    body: JSON.stringify(staffData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ خطا در ایجاد Staff: ${response.status} - ${errorText}`);
    if (response.status === 401) {
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
    }
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }
  
  return await response.json();
};

export const createAgent = async (
  venokStaffId: number,
  staffName: string,
  headers: Record<string, string>
): Promise<AgentResponse> => {
  const agentData = {
    venokStaffId: venokStaffId,
    coreStaffId: venokStaffId,
    staffName: staffName,
    isActive: true,
  };

  const response = await fetch(`${SUPPORT_API_URL}/support/agent`, {
    method: 'POST',
    headers,
    body: JSON.stringify(agentData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ خطا در ایجاد اپراتور: ${response.status} - ${errorText}`);
    if (response.status === 401) {
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
    }
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

export const assignAgentToTeam = async (agentId: number, teamId: number, role: string): Promise<void> => {
  const headers = await getHeadersWithRefresh();
  if (!headers.Authorization) {
    throw new Error('توکن معتبر یافت نشد');
  }
  
  const assignData = {
    teamId: teamId,
    role: role === "مدیر دپارتمان" ? "lead" : "member",
  };
  
  const response = await fetch(`${SUPPORT_API_URL}/support/agent/${agentId}/team`, {
    method: 'POST',
    headers,
    body: JSON.stringify(assignData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ خطا در تخصیص به دپارتمان: ${response.status} - ${errorText}`);
    if (response.status === 401) {
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
    }
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }
};

export const updateAgent = async (agentId: number, isActive: boolean): Promise<void> => {
  const headers = await getHeadersWithRefresh();
  if (!headers.Authorization) {
    throw new Error('توکن معتبر یافت نشد');
  }
  
  const updateData = {
    isActive: isActive,
  };
  
  const response = await fetch(`${SUPPORT_API_URL}/support/agent/${agentId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updateData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
    }
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }
};

export const deleteAgent = async (agentId: number): Promise<void> => {
  const headers = await getHeadersWithRefresh();
  if (!headers.Authorization) {
    throw new Error('توکن معتبر یافت نشد');
  }
  
  const response = await fetch(`${SUPPORT_API_URL}/support/agent/${agentId}`, {
    method: 'DELETE',
    headers,
  });
  
  if (response.status === 404) {
    console.log(`⚠️ اپراتور ${agentId} قبلاً حذف شده است`);
    return;
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
    }
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }
};

export const deleteStaff = async (staffId: number): Promise<void> => {
  try {
    const headers = await getHeadersWithRefresh();
    if (!headers.Authorization) return;
    
    const response = await fetch(`${API_URL}/staff/${staffId}`, {
      method: 'DELETE',
      headers,
    });
    
    if (response.status === 404) {
      console.log(`⚠️ staff ${staffId} قبلاً حذف شده است`);
      return;
    }
    
    if (!response.ok) {
      console.warn(`⚠️ خطا در حذف staff: ${response.status}`);
    }
  } catch (error) {
    console.warn('⚠️ خطا در حذف staff:', error);
  }
};

export const updateStaff = async (staffId: number, code: string): Promise<void> => {
  const headers = await getHeadersWithRefresh();
  if (!headers.Authorization) {
    throw new Error('توکن معتبر یافت نشد');
  }
  
  const response = await fetch(`${API_URL}/staff/${staffId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ code }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.warn(`⚠️ خطا در به‌روزرسانی Staff: ${response.status} - ${errorText}`);
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};