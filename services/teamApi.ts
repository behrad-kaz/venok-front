// services/teamApi.ts
import { api } from './api-client';

// ✅ تایپ برای ایجاد تیم (دپارتمان)
export interface CreateTeamDto {
  name: string;
  description: string;
  color: string;
  isActive: boolean;
}

// ✅ تایپ برای به‌روزرسانی تیم
export interface UpdateTeamDto {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

// ✅ تایپ برای پاسخ تیم
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

// ✅ تابع تولید رنگ تصادفی
const generateRandomColor = (): string => {
  const colors = [
    '#59D8C3', '#FF6B6B', '#F2B84B', '#8B7FDF', 
    '#4DABF7', '#FF9F43', '#00D2D3', '#A29BFE',
    '#FD79A8', '#00B894', '#E17055', '#74B9FF'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// ✅ URL سرویس Support
const SUPPORT_API_URL = 'http://localhost:3004';

// ✅ تابع کمکی برای دریافت هدرها
const getHeaders = () => {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const contextToken = typeof window !== 'undefined' ? localStorage.getItem('contextToken') : null;
  
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

// ✅ 1. ایجاد تیم (دپارتمان) جدید - POST /support/team
export const createTeam = async (
  data: Omit<CreateTeamDto, 'color'>
): Promise<TeamResponse> => {
  const requestBody: CreateTeamDto = {
    ...data,
    color: generateRandomColor(),
  };

  console.log('📤 ارسال به سرور (POST /support/team):', requestBody);

  const response = await fetch(`${SUPPORT_API_URL}/support/team`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ خطا در ایجاد تیم:', errorText);
    throw new Error(`خطا در ایجاد تیم: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// ✅ 2. دریافت همه تیم‌ها - GET /support/team
export const getTeams = async (status?: 'active' | 'inactive'): Promise<TeamResponse[]> => {
  const query = status ? `?status=${status}` : '';
  console.log(`📤 دریافت همه تیم‌ها (GET /support/team${query})`);

  const response = await fetch(`${SUPPORT_API_URL}/support/team${query}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ خطا در دریافت تیم‌ها:', errorText);
    throw new Error(`خطا در دریافت تیم‌ها: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// ✅ 3. دریافت تیم با ID - GET /support/team/{teamId}
export const getTeamById = async (id: number): Promise<TeamResponse> => {
  console.log(`📤 دریافت تیم با ID: ${id} (GET /support/team/${id})`);

  const response = await fetch(`${SUPPORT_API_URL}/support/team/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ خطا در دریافت تیم:', errorText);
    throw new Error(`خطا در دریافت تیم: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// ✅ 4. به‌روزرسانی تیم - PATCH /support/team/{teamId}
export const updateTeam = async (
  id: number,
  data: UpdateTeamDto
): Promise<TeamResponse> => {
  console.log(`📤 به‌روزرسانی تیم با ID: ${id} (PATCH /support/team/${id})`, data);

  const response = await fetch(`${SUPPORT_API_URL}/support/team/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ خطا در به‌روزرسانی تیم:', errorText);
    throw new Error(`خطا در به‌روزرسانی تیم: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// ✅ 5. حذف تیم - DELETE /support/team/{teamId}
export const deleteTeam = async (id: number): Promise<boolean> => {
  console.log(`📤 حذف تیم با ID: ${id} (DELETE /support/team/${id})`);

  const response = await fetch(`${SUPPORT_API_URL}/support/team/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ خطا در حذف تیم:', errorText);
    throw new Error(`خطا در حذف تیم: ${response.status} - ${errorText}`);
  }

  return true;
};