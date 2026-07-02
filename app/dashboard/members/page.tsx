// app/dashboard/members/page.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Search, Plus, Users, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { useRoleStore } from "@/stores/useRoleStore";
import { Member, Department } from "@/components/dashboard/members/types";
import StatsCards from "@/components/dashboard/members/StatsCards";
import MemberFilters from "@/components/dashboard/members/MemberFilters";
import MemberCard from "@/components/dashboard/members/MemberCard";
import MemberSidebar from "@/components/dashboard/members/MemberSidebar";
import DepartmentMemberCard from "@/components/dashboard/members/DepartmentMemberCard";
import DepartmentStatsCards from "@/components/dashboard/members/DepartmentStatsCards";
import { useModal } from "@/components/ui/modal";

// ========== تایپ‌های API ==========
interface AgentResponse {
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

interface TeamResponse {
  id: number;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface StaffResponse {
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

// ========== تابع دریافت هدرها با رفرش خودکار توکن ==========
const getHeadersWithRefresh = async (): Promise<Record<string, string>> => {
  console.log('🔍 شروع دریافت هدرها...');
  
  let accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  const contextToken = typeof window !== 'undefined' ? localStorage.getItem('contextToken') : null;
  
  console.log(`📌 accessToken: ${accessToken ? '✅ موجود' : '❌ وجود ندارد'}`);
  console.log(`📌 refreshToken: ${refreshToken ? '✅ موجود' : '❌ وجود ندارد'}`);
  console.log(`📌 contextToken: ${contextToken ? '✅ موجود' : '❌ وجود ندارد'}`);
  
  if (!accessToken && refreshToken) {
    console.log('🔄 توکن موجود نیست، تلاش برای رفرش...');
    try {
      const response = await fetch('http://localhost:3001/auth/user/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        accessToken = data.accessToken;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('userToken', accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        console.log('✅ توکن با موفقیت رفرش شد');
      } else {
        console.error('❌ رفرش توکن ناموفق:', response.status);
        if (response.status === 401) {
          console.log('🔄 ریدایرکت به لاگین...');
          localStorage.removeItem('isLoggedIn');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return {};
        }
      }
    } catch (error) {
      console.error('❌ خطا در رفرش توکن:', error);
    }
  }
  
  if (!accessToken) {
    console.error('❌ هیچ توکن معتبری وجود ندارد');
    localStorage.removeItem('isLoggedIn');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return {};
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  headers['Authorization'] = `Bearer ${accessToken}`;
  console.log(`🔑 Authorization header اضافه شد`);
  
  if (contextToken) {
    headers['x-context-token'] = contextToken;
    console.log(`🔑 x-context-token اضافه شد`);
  } else {
    console.warn('⚠️ contextToken وجود ندارد!');
  }
  
  console.log('✅ هدرها آماده هستند');
  return headers;
};

// ========== تابع ایمن برای دریافت JSON ==========
const safeJson = async <T,>(response: Response): Promise<T | null> => {
  try {
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};

// ========== تابع دریافت تیم‌ها (دپارتمان‌ها) ==========
const fetchTeams = async (): Promise<TeamResponse[]> => {
  try {
    const headers = await getHeadersWithRefresh();
    if (!headers.Authorization) {
      console.error('❌ هدر Authorization وجود ندارد');
      return [];
    }
    
    const response = await fetch('http://localhost:3004/support/team', {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      console.error(`❌ خطا در دریافت تیم‌ها: ${response.status}`);
      if (response.status === 401) {
        localStorage.removeItem('isLoggedIn');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      return [];
    }
    
    const data = await safeJson<TeamResponse[]>(response);
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    return data.filter((team: TeamResponse) => team.deletedAt === null);
  } catch (error) {
    console.error('❌ خطا در دریافت تیم‌ها:', error);
    return [];
  }
};

// ========== تابع دریافت اپراتورها (اعضا) - همه اعضا (فعال و غیرفعال) ==========
const fetchAgents = async (): Promise<AgentResponse[]> => {
  try {
    const headers = await getHeadersWithRefresh();
    if (!headers.Authorization) {
      console.error('❌ هدر Authorization وجود ندارد');
      return [];
    }
    
    const response = await fetch('http://localhost:3004/support/agent', {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      console.error(`❌ خطا در دریافت اپراتورها: ${response.status}`);
      if (response.status === 401) {
        localStorage.removeItem('isLoggedIn');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      return [];
    }
    
    const data = await safeJson<AgentResponse[]>(response);
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    return data.filter((agent: AgentResponse) => agent.deletedAt === null);
  } catch (error) {
    console.error('❌ خطا در دریافت اپراتورها:', error);
    return [];
  }
};

// ========== تابع دریافت Staff با شماره همراه ==========
const fetchStaff = async (venokStaffId: number): Promise<StaffResponse | null> => {
  try {
    const headers = await getHeadersWithRefresh();
    if (!headers.Authorization) {
      console.error('❌ هدر Authorization وجود ندارد');
      return null;
    }
    
    const response = await fetch(`http://localhost:3001/staff/${venokStaffId}`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`ℹ️ Staff با venokStaffId ${venokStaffId} یافت نشد (404)`);
      }
      return null;
    }
    
    const data = await safeJson<StaffResponse>(response);
    return data;
  } catch (error) {
    console.error(`❌ خطا در دریافت staff ${venokStaffId}:`, error);
    return null;
  }
};

// ========== تابع دریافت تعداد staffهای موجود ==========
const getStaffCount = async (): Promise<number> => {
  try {
    const headers = await getHeadersWithRefresh();
    if (!headers.Authorization) {
      console.error('❌ هدر Authorization وجود ندارد');
      return 1;
    }
    
    const response = await fetch('http://localhost:3001/staff/me', {
      method: 'GET',
      headers,
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📡 اطلاعات staff فعلی:', data);
      return data.id || 1;
    }
    return 1;
  } catch (error) {
    console.warn('⚠️ خطا در دریافت تعداد staff:', error);
    return 1;
  }
};

// ========== تابع تبدیل Agent به Member با شماره همراه ==========
const mapAgentToMember = (
  agent: AgentResponse, 
  departments: Department[],
  staffMap: Map<number, { name: string; phone: string; staffId: number }>
): Member => {
  const staffInfo = staffMap.get(agent.id);
  const name = staffInfo?.name || agent.venokStaff?.name || `کاربر ${agent.id}`;
  const phone = staffInfo?.phone || '';
  
  const nameParts = name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  let departmentId = 0;
  let departmentName = '';
  let role: "مدیر دپارتمان" | "کارمند" = "کارمند";
  
  if (agent.supportAgentTeams && agent.supportAgentTeams.length > 0) {
    const team = agent.supportAgentTeams[0];
    if (team.team) {
      departmentName = team.team.name;
      const dept = departments.find(d => d.name === team.team.name);
      if (dept) {
        departmentId = dept.id;
      }
    }
    role = team.role === 'lead' ? 'مدیر دپارتمان' : 'کارمند';
  }
  
  const username = staffInfo?.name?.toLowerCase().replace(/\s/g, '') || `user${agent.id}`;
  
  return {
    id: agent.id,
    firstName,
    lastName,
    username,
    phone: phone,
    role: role,
    departmentId,
    departmentName,
    status: agent.isActive ? 'active' : 'inactive',
    presence: agent.lastOnlineAt ? 'online' : 'offline',
    lastActivity: agent.lastOnlineAt ? 'آنلاین' : 'آفلاین',
    openTickets: 0,
    staffId: staffInfo?.staffId || 0,
  };
};

// ========== تابع محاسبه آمار ==========
const calculateStats = (members: Member[]) => {
  return {
    totalMembers: members.length,
    managersCount: members.filter(m => m.role === 'مدیر دپارتمان').length,
    activeMembersCount: members.filter(m => m.status === 'active').length, // ✅ تغییر به activeMembersCount
    inactiveMembersCount: members.filter(m => m.status === 'inactive').length,
  };
};

// ========== کامپوننت اصلی ==========
export default function MembersPage() {
  const { role } = useRoleStore();
  const { showSuccess, showError, showWarning, showConfirm } = useModal();
  
  // ========== STATE ==========
  const [members, setMembers] = useState<Member[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // برای مدیر کل
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPresence, setSelectedPresence] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  
  // برای مدیر دپارتمان
  const [deptSearchQuery, setDeptSearchQuery] = useState("");
  const [deptPresenceFilter, setDeptPresenceFilter] = useState("all");
  const [deptStatusFilter, setDeptStatusFilter] = useState("all");
  
  // mapping‌ها
  const [staffIdMap, setStaffIdMap] = useState<Map<number, { name: string; phone: string; staffId: number }>>(new Map());
  const [teamIdMap, setTeamIdMap] = useState<Map<string, number>>(new Map());
  const [venokStaffCounter, setVenokStaffCounter] = useState<number>(0);
  
  const isInitialized = useRef(false);
  
  // دپارتمان مدیر دپارتمان (در حالت واقعی از پروفایل کاربر می‌آید)
  const managerDepartment = "پشتیبانی";
  
  // ========== بارگذاری داده‌ها ==========
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔄 شروع بارگذاری اطلاعات...');
      
      const teams = await fetchTeams();
      const deptList: Department[] = teams.map(team => ({
        id: team.id,
        name: team.name,
      }));
      setDepartments(deptList);
      console.log(`✅ ${deptList.length} دپارتمان دریافت شد`);
      
      const teamMap = new Map<string, number>();
      teams.forEach(team => {
        teamMap.set(team.name, team.id);
      });
      setTeamIdMap(teamMap);
      console.log(`✅ ${teamMap.size} تیم در map ذخیره شد`);
      
      const agents = await fetchAgents();
      console.log(`✅ ${agents.length} اپراتور دریافت شد`);
      
      if (agents.length === 0) {
        setMembers([]);
        setIsLoading(false);
        return;
      }
      
      const staffPromises = agents.map(async (agent) => {
        if (agent.venokStaffId) {
          const staff = await fetchStaff(agent.venokStaffId);
          return { 
            agentId: agent.id, 
            staffInfo: staff ? { name: staff.name, phone: staff.phone || '', staffId: staff.id } : null 
          };
        }
        return { agentId: agent.id, staffInfo: null };
      });
      
      const staffResults = await Promise.all(staffPromises);
      const staffMap = new Map<number, { name: string; phone: string; staffId: number }>();
      staffResults.forEach(({ agentId, staffInfo }) => {
        if (staffInfo) {
          staffMap.set(agentId, staffInfo);
        }
      });
      setStaffIdMap(staffMap);
      console.log(`✅ ${staffMap.size} Staff دریافت شد`);
      
      let maxVenokStaffId = 0;
      for (const agent of agents) {
        if (agent.venokStaffId > maxVenokStaffId) {
          maxVenokStaffId = agent.venokStaffId;
        }
      }
      
      const staffCount = await getStaffCount();
      const newCounter = Math.max(maxVenokStaffId, staffCount);
      setVenokStaffCounter(newCounter);
      console.log(`✅ venokStaffCounter تنظیم شد: ${newCounter}`);
      
      const memberList = agents
        .filter(agent => agent.supportAgentTeams && agent.supportAgentTeams.length > 0)
        .map(agent => mapAgentToMember(agent, deptList, staffMap));
      
      setMembers(memberList);
      console.log(`✅ ${memberList.length} عضو بارگذاری شد`);
      
    } catch (error) {
      console.error('❌ خطا در بارگذاری داده‌ها:', error);
      showError('خطا در بارگذاری اطلاعات', 'خطا');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    if (!isInitialized.current) {
      loadData();
      isInitialized.current = true;
    }
  }, [loadData]);

  // ========== LOGIC برای مدیر کل ==========
  const filteredMembers = members.filter((member) => {
    const fullName = `${member.firstName} ${member.lastName}`;
    if (searchQuery && !fullName.includes(searchQuery) && !member.username.includes(searchQuery) && !member.phone.includes(searchQuery)) {
      return false;
    }
    if (selectedDepartment !== "all" && member.departmentId !== parseInt(selectedDepartment)) {
      return false;
    }
    if (selectedRole !== "all" && member.role !== selectedRole) {
      return false;
    }
    if (selectedStatus !== "all" && member.status !== selectedStatus) {
      return false;
    }
    if (selectedPresence !== "all" && member.presence !== selectedPresence) {
      return false;
    }
    return true;
  });

  // ========== تابع ایجاد Staff (با کد یکتا) ==========
  const createStaff = async (name: string, code: string): Promise<StaffResponse> => {
    const headers = await getHeadersWithRefresh();
    if (!headers.Authorization) {
      throw new Error('توکن معتبر یافت نشد');
    }
    
    // ✅ تولید code منحصربه‌فرد با استفاده از timestamp و random
    const uniqueCode = `${code}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    const staffData = {
      staff: {
        name: name,
        code: uniqueCode,
      },
      user: {
        otpChannel: "sms",
        otpRes: "string",
      },
      panelType: "erp"
    };
    
    console.log('📤 ارسال به سرور (POST /staff):', staffData);
    
    const response = await fetch('http://localhost:3001/staff', {
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
    
    const result: StaffResponse = await response.json();
    console.log('✅ Staff ایجاد شد:', result);
    
    return result;
  };

  // ========== تابع ایجاد Agent ==========
  const createAgent = async (
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

    console.log(`📤 ارسال به سرور (POST /support/agent) با venokStaffId=${venokStaffId}:`, agentData);

    const response = await fetch('http://localhost:3004/support/agent', {
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

    const result = await response.json();
    console.log('✅ اپراتور ایجاد شد:', result);
    return result;
  };

  // ========== تابع تخصیص Agent به تیم ==========
  const assignAgentToTeam = async (agentId: number, teamId: number, role: string): Promise<void> => {
    const headers = await getHeadersWithRefresh();
    if (!headers.Authorization) {
      throw new Error('توکن معتبر یافت نشد');
    }
    
    const assignData = {
      teamId: teamId,
      role: role === "مدیر دپارتمان" ? "lead" : "member",
    };
    
    console.log(`📤 ارسال به سرور (POST /support/agent/${agentId}/team):`, assignData);
    
    const response = await fetch(`http://localhost:3004/support/agent/${agentId}/team`, {
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
    
    console.log('✅ تخصیص به دپارتمان موفق');
  };

  // ========== تابع به‌روزرسانی Agent ==========
  const updateAgent = async (agentId: number, isActive: boolean): Promise<void> => {
    const headers = await getHeadersWithRefresh();
    if (!headers.Authorization) {
      throw new Error('توکن معتبر یافت نشد');
    }
    
    const updateData = {
      isActive: isActive,
    };
    
    const response = await fetch(`http://localhost:3004/support/agent/${agentId}`, {
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

  // ========== تابع حذف Agent ==========
  const deleteAgent = async (agentId: number): Promise<void> => {
    const headers = await getHeadersWithRefresh();
    if (!headers.Authorization) {
      throw new Error('توکن معتبر یافت نشد');
    }
    
    const response = await fetch(`http://localhost:3004/support/agent/${agentId}`, {
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

  // ========== تابع حذف Staff ==========
  const deleteStaff = async (staffId: number): Promise<void> => {
    try {
      const headers = await getHeadersWithRefresh();
      if (!headers.Authorization) {
        return;
      }
      
      const response = await fetch(`http://localhost:3001/staff/${staffId}`, {
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

  // ========== تولید کد یکتا برای Staff ==========
  const generateUniqueCode = (password: string): string => {
    // یک کد منحصربه‌فرد با استفاده از timestamp و random
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `P_${timestamp}_${random}`;
  };

  // ========== افزودن عضو جدید ==========
  const handleAddMember = async (data: {
    fullName: string;
    phone: string;
    departmentId: number;
    role: "مدیر دپارتمان" | "کارمند";
    status: "active" | "inactive";
    password?: string;
  }) => {
    try {
      setIsSubmitting(true);
      
      const fullName = data.fullName.trim();
      // ✅ تولید code منحصربه‌فرد
      const code = generateUniqueCode(data.password || '');
      
      const selectedDept = departments.find(d => d.id === data.departmentId);
      if (!selectedDept) {
        throw new Error('دپارتمان انتخاب شده یافت نشد');
      }
      console.log(`📌 دپارتمان انتخاب شده: ${selectedDept.name} (${selectedDept.id})`);
      
      let realTeamId = teamIdMap.get(selectedDept.name);
      
      if (!realTeamId) {
        console.log('🔄 تیم در کش یافت نشد، دریافت از API...');
        const headers = await getHeadersWithRefresh();
        if (!headers.Authorization) {
          throw new Error('توکن معتبر یافت نشد');
        }
        const teamsResponse = await fetch('http://localhost:3004/support/team', {
          method: 'GET',
          headers,
        });
        
        if (teamsResponse.ok) {
          const teams = await teamsResponse.json() as any[];
          const foundTeam = teams.find((t: any) => t.name === selectedDept.name);
          if (foundTeam) {
            realTeamId = foundTeam.id;
            setTeamIdMap(prev => new Map(prev).set(selectedDept.name, foundTeam.id));
            console.log(`✅ teamId پیدا شد: ${realTeamId}`);
          }
        }
      }

      if (!realTeamId) {
        throw new Error(`تیم "${selectedDept.name}" در سرور یافت نشد.`);
      }

      console.log(`✅ teamId واقعی برای "${selectedDept.name}": ${realTeamId}`);

      const headers = await getHeadersWithRefresh();
      if (!headers.Authorization) {
        throw new Error('توکن معتبر یافت نشد');
      }
      
      // ✅ ارسال code منحصربه‌فرد به سرور
      const staffResult = await createStaff(fullName, code);
      console.log(`✅ Staff ایجاد شد با id: ${staffResult.id} و code: ${code}`);
      
      const newVenokStaffId = venokStaffCounter + 1;
      setVenokStaffCounter(newVenokStaffId);
      console.log(`✅ venokStaffId جدید: ${newVenokStaffId}`);

      const agentResult = await createAgent(
        newVenokStaffId,
        fullName,
        headers
      );
      console.log(`✅ اپراتور ایجاد شد با id: ${agentResult.id}`);

      await assignAgentToTeam(
        agentResult.id,
        realTeamId,
        data.role
      );
      console.log('✅ تخصیص به دپارتمان موفق');

      await loadData();
      
      showSuccess(`عضو "${fullName}" با موفقیت اضافه شد`, "موفقیت ✨");
      setIsSidebarOpen(false);
      
    } catch (error) {
      console.error('❌ خطا در افزودن عضو:', error);
      showError(
        error instanceof Error ? error.message : "خطا در افزودن عضو",
        "خطا"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========== ویرایش عضو ==========
  const handleEditMember = async (data: {
    fullName: string;
    phone: string;
    departmentId: number;
    role: "مدیر دپارتمان" | "کارمند";
    status: "active" | "inactive";
    password?: string;
  }) => {
    if (!editingMember) return;
    
    try {
      setIsSubmitting(true);
      
      await updateAgent(editingMember.id, data.status === 'active');
      console.log('✅ Agent به‌روزرسانی شد');
      
      if (data.password) {
        try {
          const headers = await getHeadersWithRefresh();
          if (!headers.Authorization) {
            throw new Error('توکن معتبر یافت نشد');
          }
          
          const staffId = editingMember.staffId;
          if (staffId) {
            console.log(`🔄 به‌روزرسانی Staff با id: ${staffId}`);
            
            const updateStaffResponse = await fetch(`http://localhost:3001/staff/${staffId}`, {
              method: 'PATCH',
              headers,
              body: JSON.stringify({
                code: data.password
              }),
            });
            
            if (!updateStaffResponse.ok) {
              const errorText = await updateStaffResponse.text();
              console.warn(`⚠️ خطا در به‌روزرسانی Staff: ${updateStaffResponse.status} - ${errorText}`);
            } else {
              console.log('✅ Staff با رمز عبور جدید به‌روزرسانی شد');
            }
          }
        } catch (staffError) {
          console.warn('⚠️ خطا در به‌روزرسانی Staff، اما ادامه می‌دهیم:', staffError);
        }
      }
      
      const headers = await getHeadersWithRefresh();
      if (!headers.Authorization) {
        throw new Error('توکن معتبر یافت نشد');
      }
      
      const oldTeamResponse = await fetch(`http://localhost:3004/support/agent/${editingMember.id}/team`, {
        method: 'GET',
        headers,
      });
      
      if (oldTeamResponse.ok) {
        const oldTeams = await oldTeamResponse.json();
        for (const team of oldTeams) {
          await fetch(`http://localhost:3004/support/agent/${editingMember.id}/team/${team.teamId}`, {
            method: 'DELETE',
            headers,
          });
        }
      }
      
      const selectedDept = departments.find(d => d.id === data.departmentId);
      if (!selectedDept) {
        throw new Error('دپارتمان انتخاب شده یافت نشد');
      }
      
      let realTeamId = teamIdMap.get(selectedDept.name);
      
      if (!realTeamId) {
        const teamsResponse = await fetch('http://localhost:3004/support/team', {
          method: 'GET',
          headers,
        });
        
        if (teamsResponse.ok) {
          const teams = await teamsResponse.json() as any[];
          const foundTeam = teams.find((t: any) => t.name === selectedDept.name);
          if (foundTeam) {
            realTeamId = foundTeam.id;
            setTeamIdMap(prev => new Map(prev).set(selectedDept.name, foundTeam.id));
          }
        }
      }
      
      if (!realTeamId) {
        throw new Error(`تیم "${selectedDept.name}" در سرور یافت نشد.`);
      }
      
      await assignAgentToTeam(editingMember.id, realTeamId, data.role);
      console.log('✅ تخصیص مجدد به دپارتمان موفق');
      
      await loadData();
      
      showSuccess(`عضو "${data.fullName}" با موفقیت ویرایش شد`, "موفقیت ✨");
      setIsSidebarOpen(false);
      setEditingMember(null);
      
    } catch (error) {
      console.error('❌ خطا در ویرایش عضو:', error);
      showError(
        error instanceof Error ? error.message : "خطا در ویرایش عضو",
        "خطا"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========== حذف عضو ==========
  const handleRemoveMember = async (member: Member) => {
    const fullName = `${member.firstName} ${member.lastName}`;
    
    showConfirm(
      `آیا از حذف "${fullName}" از تیم مطمئن هستید؟`,
      "تایید حذف",
      async () => {
        try {
          setIsSubmitting(true);
          
          await deleteAgent(member.id);
          console.log('✅ Agent حذف شد');
          
          if (member.staffId) {
            await deleteStaff(member.staffId);
          }
          
          await loadData();
          
          showSuccess(`عضو "${fullName}" با موفقیت حذف شد`, "موفقیت ✨");
          
        } catch (error) {
          console.error('❌ خطا در حذف عضو:', error);
          showError(
            error instanceof Error ? error.message : "خطا در حذف عضو",
            "خطا"
          );
        } finally {
          setIsSubmitting(false);
        }
      }
    );
  };

  // ========== باز کردن سایدبار ویرایش ==========
  const openEditSidebar = (member: Member) => {
    setEditingMember(member);
    setIsSidebarOpen(true);
  };

  // ========== LOGIC برای مدیر دپارتمان ==========
  const filteredDeptMembers = members.filter((member) => {
    if (member.departmentName !== managerDepartment) return false;
    
    const fullName = `${member.firstName} ${member.lastName}`;
    if (deptSearchQuery && !fullName.includes(deptSearchQuery) && !member.username.includes(deptSearchQuery)) {
      return false;
    }
    if (deptPresenceFilter !== "all" && member.presence !== deptPresenceFilter) {
      return false;
    }
    if (deptStatusFilter !== "all" && member.status !== deptStatusFilter) {
      return false;
    }
    return true;
  });

  const deptStats = {
    totalMembers: filteredDeptMembers.length,
    onlineMembers: filteredDeptMembers.filter(m => m.presence === "online").length,
    totalOpenTickets: filteredDeptMembers.reduce((sum, m) => sum + m.openTickets, 0),
    membersWithTickets: filteredDeptMembers.filter(m => m.openTickets > 0).length,
  };

  const statsData = calculateStats(members);

  // ========== نمایش لودینگ ==========
  if (isLoading) {
    return (
      <RoleGuard allowedRoles={["مدیر کل", "مدیر"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#59D8C3] animate-spin" />
            <span className="mr-3 text-gray-400">در حال بارگذاری اعضا...</span>
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  // ========== صفحه مدیر دپارتمان ==========
  if (role === "مدیر") {
    return (
      <RoleGuard allowedRoles={["مدیر"]}>
        <DashboardLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">اعضای دپارتمان</h1>
              <p className="text-sm text-gray-500">لیست و مدیریت اعضای دپارتمان {managerDepartment}</p>
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[280px] relative">
                <input
                  type="text"
                  placeholder="جستجو در اعضای دپارتمان"
                  value={deptSearchQuery}
                  onChange={(e) => setDeptSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
              <button className="px-4 py-2.5 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all whitespace-nowrap">
                درخواست تغییر عضو از مدیرکل
              </button>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">وضعیت حضور:</span>
                <div className="flex gap-2">
                  {["all", "online", "offline"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setDeptPresenceFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        deptPresenceFilter === filter
                          ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                          : "bg-[rgba(255,255,255,0.03)] border-transparent text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                      }`}
                    >
                      {filter === "all" ? "همه" : filter === "online" ? "آنلاین" : "آفلاین"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">وضعیت حساب:</span>
                <div className="flex gap-2">
                  {["all", "active", "inactive"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setDeptStatusFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        deptStatusFilter === filter
                          ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                          : "bg-[rgba(255,255,255,0.03)] border-transparent text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                      }`}
                    >
                      {filter === "all" ? "همه" : filter === "active" ? "فعال" : "غیرفعال"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DepartmentStatsCards stats={deptStats} />

            <div className="space-y-4">
              {filteredDeptMembers.map((member, index) => (
                <DepartmentMemberCard key={member.id} member={member} index={index} />
              ))}
            </div>

            {filteredDeptMembers.length === 0 && (
              <div className="text-center py-12 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">هیچ عضوی در این دپارتمان یافت نشد</p>
              </div>
            )}
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  // ========== صفحه مدیر کل ==========
  if (role === "مدیر کل") {
    return (
      <RoleGuard allowedRoles={["مدیر کل"]}>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[280px] relative">
                <input
                  type="text"
                  placeholder="جستجو بر اساس نام، شماره همراه یا نام کاربری"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
              <button
                onClick={() => {
                  setEditingMember(null);
                  setIsSidebarOpen(true);
                }}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن عضو جدید</span>
              </button>
            </div>

            <MemberFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedDepartment={selectedDepartment}
              onDepartmentChange={setSelectedDepartment}
              selectedRole={selectedRole}
              onRoleChange={setSelectedRole}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              selectedPresence={selectedPresence}
              onPresenceChange={setSelectedPresence}
              departments={departments}
            />

            <StatsCards stats={statsData} />

            <div className="space-y-4">
              {filteredMembers.map((member, index) => (
                <MemberCard 
                  key={member.id} 
                  member={member} 
                  index={index} 
                  onEdit={openEditSidebar}
                  onDelete={handleRemoveMember}
                />
              ))}
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-dashed border-[rgba(255,255,255,0.1)]">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">هیچ عضوی یافت نشد</p>
                <p className="text-xs text-gray-500 mt-1">برای افزودن عضو جدید، روی دکمه "+" کلیک کنید.</p>
              </div>
            )}
          </div>

          <MemberSidebar
            isOpen={isSidebarOpen}
            onClose={() => {
              setIsSidebarOpen(false);
              setEditingMember(null);
            }}
            editingMember={editingMember}
            departments={departments}
            onSave={editingMember ? handleEditMember : handleAddMember}
            title={editingMember ? "ویرایش اطلاعات عضو" : "افزودن عضو جدید"}
            subtitle={!editingMember ? "این اطلاعات برای ورود عضو به پنل استفاده می‌شود." : undefined}
            isSubmitting={isSubmitting}
          />
        </DashboardLayout>
      </RoleGuard>
    );
  }

  // ========== کارمند ==========
  return (
    <RoleGuard allowedRoles={["کارمند"]}>
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-400">شما دسترسی مشاهده اعضا را ندارید</p>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}