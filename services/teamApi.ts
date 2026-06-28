// services/teamApi.ts
import { api } from './api-client';

// ✅ تایپ برای ایجاد تیم
export interface CreateTeamDto {
  name: string;
  slug: string;
  description: string;
  scope: 'venok_department';
  permissionIds: number[];
  assignStaff: {
    staffId: number;
    permissionDenyIds: number[];
  }[];
}

// ✅ تایپ برای به‌روزرسانی تیم
export interface UpdateTeamDto {
  name?: string;
  slug?: string;
  description?: string;
  scope?: 'venok_department';
  assignStaff?: {
    staffId: number;
    permissionDenyIds: number[];
  }[];
  unassignStaffIds?: number[];
  addPermissionIds?: number[];
  delPermissionIds?: number[];
}

// ✅ تایپ برای پاسخ تیم
export interface TeamResponse {
  id: number;
  organizationId: number;
  workspaceId: number;
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
  scope: 'venok_department';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  permission?: {
    id: number;
    teamId: number;
    permissionId: number;
    createdAt: string;
  }[];
  teamPermissions?: {
    id: number;
    teamId: number;
    permissionId: number;
    createdAt: string;
  }[];
  staffTeams?: {
    id: number;
    staffId: number;
    teamId: number;
    createdAt: string;
    staff?: {
      id: number;
      organizationId: number;
      userId: number;
      name: string;
      code: string;
      status: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
    };
  }[];
}

// ✅ تابع تبدیل نام به slug
export const generateSlug = (name: string): string => {
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  if (!slug) slug = 'department';
  
  return `${slug}-${Date.now()}`;
};

// ✅ 1. ایجاد تیم (دپارتمان) جدید - POST /team
export const createTeam = async (
  data: Omit<CreateTeamDto, 'slug'>
): Promise<TeamResponse> => {
  const slug = generateSlug(data.name);
  
  const requestBody: CreateTeamDto = {
    ...data,
    slug,
  };

  console.log('📤 ارسال به سرور (POST /team):', requestBody);

  return api.post<TeamResponse>('/team', requestBody);
};

// ✅ 2. دریافت همه تیم‌ها - GET /team
export const getTeams = async (): Promise<TeamResponse[]> => {
  console.log('📤 دریافت همه تیم‌ها (GET /team)');
  return api.get<TeamResponse[]>('/team');
};

// ✅ 3. دریافت تیم با ID - GET /team/{teamId}
export const getTeamById = async (id: number): Promise<TeamResponse> => {
  console.log(`📤 دریافت تیم با ID: ${id} (GET /team/${id})`);
  return api.get<TeamResponse>(`/team/${id}`);
};

// ✅ 4. به‌روزرسانی تیم - PATCH /team/{teamId}
export const updateTeam = async (
  id: number,
  data: UpdateTeamDto
): Promise<TeamResponse> => {
  console.log(`📤 به‌روزرسانی تیم با ID: ${id} (PATCH /team/${id})`, data);
  return api.patch<TeamResponse>(`/team/${id}`, data);
};

// ✅ 5. حذف تیم - DELETE /team/{teamId}
export const deleteTeam = async (id: number): Promise<boolean> => {
  console.log(`📤 حذف تیم با ID: ${id} (DELETE /team/${id})`);
  return api.delete<boolean>(`/team/${id}`);
};