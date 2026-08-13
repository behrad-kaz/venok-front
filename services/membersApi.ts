// ============================================================
// FILE: services/membersApi.ts
// سرویس‌های API مربوط به اعضا (Staff) - نسخه یکپارچه
// ============================================================

import { api } from "./api-client";

// ============================================================
// تایپ‌ها
// ============================================================

export interface StaffResponse {
  id: number;
  organizationId: number;
  userId: number;
  name: string;
  code: string;
  status: string;
  role: string;
  departmentId: number | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  lastOnlineAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  department?: {
    id: number;
    name: string;
    color: string;
  };
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    avatar: string | null;
  };
}

export interface CreateStaffDto {
  name: string;
  code: string;
  phone: string;
  password: string;
  email?: string;
  departmentId?: number;
  role?: 'staff' | 'department_manager';
  isActive?: boolean;
}

export interface UpdateStaffDto {
  name?: string;
  code?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
  departmentId?: number;
  role?: string;
  password?: string;
}

// ============================================================
// تایپ‌های کمکی برای تبدیل به AgentResponse
// ============================================================

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

// ============================================================
// توابع API
// ============================================================

// -------- تیم‌ها (دپارتمان‌ها) --------

/**
 * دریافت لیست تیم‌ها (دپارتمان‌ها)
 */
export const fetchTeams = async (): Promise<TeamResponse[]> => {
  try {
    const response = await api.get<TeamResponse[]>('/support/team');
    return response.filter((team: TeamResponse) => team.deletedAt === null);
  } catch (error) {
    console.error('❌ خطا در دریافت تیم‌ها:', error);
    return [];
  }
};

// -------- Staff (اعضا) --------

/**
 * دریافت لیست همه Staffها (همراه با دپارتمان و بدون دپارتمان)
 * فقط Staffهای فعال (حذف نشده) را برمی‌گرداند
 */
export const fetchAgents = async (): Promise<AgentResponse[]> => {
  try {
    const response = await api.get<{ data: StaffResponse[] }>('/staff');
    const staffList = response.data || [];
    
    console.log(`📡 ${staffList.length} Staff دریافت شد`);
    
    // ✅ فقط Staffهای فعال (حذف نشده)
    const activeStaffList = staffList.filter((staff: StaffResponse) => staff.deletedAt === null);
    
    console.log(`✅ ${activeStaffList.length} Staff فعال (حذف نشده)`);
    
    // ✅ تبدیل Staff به AgentResponse
    const agents: AgentResponse[] = activeStaffList.map((staff: StaffResponse) => {
      const supportAgentTeams = staff.departmentId ? [
        {
          id: staff.id,
          agentId: staff.id,
          teamId: staff.departmentId,
          role: staff.role === 'department_manager' ? 'lead' : 'member',
          createdAt: staff.createdAt,
          team: {
            id: staff.departmentId,
            name: staff.department?.name || 'بدون دپارتمان',
            description: '',
            color: '#59D8C3',
            isActive: true,
            createdAt: staff.createdAt,
            updatedAt: staff.updatedAt,
            deletedAt: null,
          }
        }
      ] : [];
    
      return {
        id: staff.id,
        venokStaffId: staff.id,
        isActive: staff.isActive,
        lastOnlineAt: staff.lastOnlineAt || null,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
        deletedAt: staff.deletedAt || null,
        venokStaff: {
          id: staff.id,
          name: staff.name,
        },
        supportAgentTeams: supportAgentTeams,
      };
    });
    
    console.log(`✅ ${agents.length} Agent ساخته شد (فقط فعال‌ها)`);
    return agents;
    
  } catch (error) {
    console.error('❌ خطا در دریافت اپراتورها:', error);
    return [];
  }
};

/**
 * دریافت لیست Staffها (نسخه ساده برای Onboarding)
 */
export const fetchStaffList = async (): Promise<StaffResponse[]> => {
  try {
    console.log('📡 دریافت Staffها از /staff...');
    const response = await api.get<{ data: StaffResponse[] }>('/staff');
    return response.data || [];
  } catch (error) {
    console.error('❌ خطا در دریافت Staffها:', error);
    return [];
  }
};

/**
 * دریافت Staff با شناسه
 */
export const fetchStaff = async (staffId: number): Promise<StaffResponse | null> => {
  try {
    console.log(`📤 دریافت Staff با id: ${staffId}`);
    const result = await api.get<StaffResponse>(`/staff/${staffId}`);
    console.log(`✅ Staff ${staffId} دریافت شد`);
    return result;
  } catch (error: any) {
    if (error?.message?.includes('404')) {
      console.log(`ℹ️ Staff با id ${staffId} یافت نشد (404)`);
    } else {
      console.error(`❌ خطا در دریافت staff ${staffId}:`, error);
    }
    return null;
  }
};

/**
 * دریافت Staff بر اساس ID (نسخه ساده برای Onboarding)
 */
export const getStaffById = async (id: number): Promise<StaffResponse> => {
  const staff = await fetchStaff(id);
  if (!staff) {
    throw new Error(`Staff با شناسه ${id} یافت نشد`);
  }
  return staff;
};

/**
 * دریافت تعداد Staff (برای تولید کد منحصربه‌فرد)
 */
export const getStaffCount = async (): Promise<number> => {
  try {
    const response = await api.get<{ data: StaffResponse[] }>('/staff');
    const staffList = response.data || [];
    return staffList.length + 1;
  } catch (error) {
    console.warn('⚠️ خطا در دریافت تعداد staff:', error);
    return 1;
  }
};

/**
 * ایجاد Staff جدید
 */
export const createStaff = async (data: CreateStaffDto): Promise<StaffResponse> => {
  // ✅ اعتبارسنجی رمز عبور
  if (!data.password || data.password.length < 8) {
    console.error('❌ رمز عبور نامعتبر:', data.password);
    throw new Error('رمز عبور باید حداقل ۸ کاراکتر باشد');
  }

  // ✅ اعتبارسنجی departmentId
  let departmentId: number | undefined = undefined;
  if (data.departmentId) {
    departmentId = Number(data.departmentId);
    if (isNaN(departmentId) || departmentId <= 0) {
      console.error(`❌ departmentId نامعتبر: ${data.departmentId}`);
      throw new Error(`شناسه دپارتمان نامعتبر است: ${data.departmentId}`);
    }
  }

  const payload = {
    name: data.name,
    code: data.code,
    phone: data.phone,
    password: data.password,
    email: data.email || '',
    departmentId: departmentId,
    role: data.role || 'staff',
    isActive: data.isActive !== undefined ? data.isActive : true,
  };
  
  console.log('📤 ارسال به سرور (POST /staff):', { ...payload, password: '****' });
  
  return api.post<StaffResponse>('/staff', payload);
};

/**
 * به‌روزرسانی Staff
 */
export const updateStaff = async (staffId: number, data: UpdateStaffDto): Promise<StaffResponse> => {
  console.log(`📤 به‌روزرسانی Staff با id: ${staffId}`, data);
  
  // حذف فیلدهای undefined
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );
  
  if (Object.keys(cleanData).length === 0) {
    console.log(`ℹ️ هیچ داده‌ای برای به‌روزرسانی وجود ندارد`);
    const staff = await fetchStaff(staffId);
    if (!staff) {
      throw new Error(`Staff با شناسه ${staffId} یافت نشد`);
    }
    return staff;
  }
  
  try {
    const result = await api.patch<StaffResponse>(`/staff/${staffId}`, cleanData);
    console.log(`✅ Staff ${staffId} به‌روزرسانی شد`);
    return result;
  } catch (error: any) {
    console.error(`❌ خطا در به‌روزرسانی Staff ${staffId}:`, error);
    throw error;
  }
};

/**
 * به‌روزرسانی وضعیت فعال/غیرفعال Staff
 */
export const updateAgent = async (staffId: number, isActive: boolean): Promise<void> => {
  try {
    console.log(`📤 به‌روزرسانی وضعیت Staff با id: ${staffId} → ${isActive ? 'فعال' : 'غیرفعال'}`);
    
    await api.patch<void>(`/staff/${staffId}`, { isActive });
    
    console.log(`✅ وضعیت Staff با id ${staffId} به‌روزرسانی شد`);
    
  } catch (error: any) {
    console.error(`❌ خطا در به‌روزرسانی Staff ${staffId}:`, error);
    
    if (error?.message?.includes('404') || error?.status === 404) {
      console.log(`⚠️ Staff با id ${staffId} یافت نشد (404)`);
      throw new Error(`کارمند با شناسه ${staffId} یافت نشد`);
    }
    throw error;
  }
};

/**
 * حذف Staff (سافت‌دیلت)
 */
export const deleteStaff = async (staffId: number): Promise<boolean> => {
  console.log(`🗑️ حذف Staff با id: ${staffId}`);
  
  try {
    await api.delete<void>(`/staff/${staffId}`);
    console.log(`✅ Staff با id ${staffId} حذف شد`);
    return true;
  } catch (error: any) {
    if (error?.message?.includes('404') || error?.status === 404) {
      console.log(`⚠️ Staff ${staffId} قبلاً حذف شده است`);
      return true;
    }
    console.warn(`⚠️ خطا در حذف Staff ${staffId}:`, error);
    // ✅ حتی با خطا، true برگردان تا UI به‌روز شود
    return true;
  }
};

/**
 * حذف Agent (همان Staff)
 */
export const deleteAgent = async (staffId: number): Promise<boolean> => {
  return deleteStaff(staffId);
};

/**
 * اختصاص Staff به تیم (دپارتمان)
 */
export const assignAgentToTeam = async (staffId: number, teamId: number, role: string): Promise<void> => {
  const assignData = {
    departmentId: teamId,
    role: role === "مدیر دپارتمان" ? "department_manager" : "staff",
  };
  
  console.log(`📤 اختصاص Staff ${staffId} به تیم ${teamId} با نقش ${role}`, assignData);
  
  await api.patch<void>(`/staff/${staffId}`, assignData);
};
// ============================================================