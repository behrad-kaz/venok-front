// ============================================================
// FILE: components/dashboard/members/hooks/useMembers.ts
// ============================================================
import { useState, useEffect, useCallback, useRef } from "react";
import { Member, Department, StatsData, AgentResponse, TeamResponse } from "../types";
import {
  fetchTeams,
  fetchAgents,
  fetchStaff,
  getStaffCount,
  createStaff,
  updateStaff,
  updateAgent,
  deleteAgent,
  deleteStaff,
  assignAgentToTeam,
} from "@/services/membersApi";
import { useModal } from "@/components/ui/modal";

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
  let departmentName = 'بدون دپارتمان';
  let role: "مدیر دپارتمان" | "کارمند" = "کارمند";
  
  if (agent.supportAgentTeams && agent.supportAgentTeams.length > 0) {
    const team = agent.supportAgentTeams[0];
    const teamData = team?.team;
    if (teamData) {
      departmentName = teamData.name;
      const dept = departments.find(d => d.name === teamData.name);
      if (dept) {
        departmentId = dept.id;
      }
    }
    if (team) {
      role = team.role === 'lead' ? 'مدیر دپارتمان' : 'کارمند';
    }
  }
  
  const username = staffInfo?.name?.toLowerCase().replace(/\s/g, '') || `user${agent.id}`;
  
  const member: Member = {
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
    staffId: agent.id, // ✅ مستقیماً از agent.id استفاده کن
  };
  
  console.log(`📋 Member ساخته شد:`, { 
    id: member.id, 
    staffId: member.staffId, 
    name: member.firstName + ' ' + member.lastName 
  });
  
  return member;
};

const calculateStats = (members: Member[]): StatsData => {
  return {
    totalMembers: members.length,
    managersCount: members.filter(m => m.role === 'مدیر دپارتمان').length,
    activeMembersCount: members.filter(m => m.status === 'active').length,
    inactiveMembersCount: members.filter(m => m.status === 'inactive').length,
  };
};

const generateUniqueCode = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `P_${timestamp}_${random}`;
};

export function useMembers() {
  const { showSuccess, showError, showWarning, showConfirm } = useModal();
  
  const [members, setMembers] = useState<Member[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [staffIdMap, setStaffIdMap] = useState<Map<number, { name: string; phone: string; staffId: number }>>(new Map());
  const [teamIdMap, setTeamIdMap] = useState<Map<string, number>>(new Map());
  const [venokStaffCounter, setVenokStaffCounter] = useState<number>(0);
  
  const isInitialized = useRef(false);

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
      
      const teamMap = new Map<string, number>();
      teams.forEach(team => {
        teamMap.set(team.name, team.id);
      });
      setTeamIdMap(teamMap);
      
      const agents = await fetchAgents();
      
      if (agents.length === 0) {
        setMembers([]);
        setIsLoading(false);
        return;
      }
      
      // ✅ برای هر Agent، Staff رو دریافت کن و اطلاعات رو تکمیل کن
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
      
      let maxStaffId = 0;
      for (const agent of agents) {
        if (agent.venokStaffId > maxStaffId) {
          maxStaffId = agent.venokStaffId;
        }
      }
      
      const staffCount = await getStaffCount();
      const newCounter = Math.max(maxStaffId, staffCount);
      setVenokStaffCounter(newCounter);
      
      const memberList = agents.map(agent => mapAgentToMember(agent, deptList, staffMap));
      
      console.log('📋 لیست نهایی Members:', memberList.map(m => ({ id: m.id, staffId: m.staffId, name: m.firstName + ' ' + m.lastName })));
      
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
      const code = generateUniqueCode();
      
      const selectedDept = departments.find(d => d.id === data.departmentId);
      if (!selectedDept) {
        throw new Error('دپارتمان انتخاب شده یافت نشد');
      }
      
      let realTeamId = teamIdMap.get(selectedDept.name);
      
      if (!realTeamId) {
        const teams = await fetchTeams();
        const foundTeam = teams.find((t: TeamResponse) => t.name === selectedDept.name);
        if (foundTeam) {
          realTeamId = foundTeam.id;
          setTeamIdMap(prev => new Map(prev).set(selectedDept.name, foundTeam.id));
        }
      }

      if (!realTeamId) {
        throw new Error(`تیم "${selectedDept.name}" در سرور یافت نشد.`);
      }

      const staffResult = await createStaff({
        name: fullName,
        code: code,
        phone: data.phone,
        password: data.password || '12345678',
        departmentId: realTeamId,
        role: data.role === "مدیر دپارتمان" ? "department_manager" : "staff",
        isActive: data.status === 'active',
      });
      
      console.log('✅ Staff ایجاد شد:', staffResult);

      await loadData();
      
      showSuccess(`عضو "${fullName}" با موفقیت اضافه شد`, "موفقیت ✨");
      
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

 // ============================================================
// FILE: components/dashboard/members/hooks/useMembers.ts
// فقط بخش handleEditMember اصلاح شده
// ============================================================
const handleEditMember = async (data: {
  fullName: string;
  phone: string;
  departmentId: number;
  role: "مدیر دپارتمان" | "کارمند";
  status: "active" | "inactive";
  password?: string;
}, editingMember: Member | null) => {
  if (!editingMember) return;
  
  try {
    setIsSubmitting(true);
    
    const staffId = editingMember.staffId || editingMember.id;
    
    console.log(`🔄 شروع ویرایش عضو با staffId: ${staffId}`, {
      memberId: editingMember.id,
      staffId: editingMember.staffId,
      oldDepartmentId: editingMember.departmentId,
      newDepartmentId: data.departmentId,
      oldRole: editingMember.role,
      newRole: data.role,
      fullName: data.fullName,
      phone: data.phone,
      status: data.status,
      hasPassword: !!data.password,
    });
    
    // ✅ 1. به‌روزرسانی وضعیت فعال/غیرفعال
    await updateAgent(staffId, data.status === 'active');
    console.log(`✅ وضعیت عضو با staffId ${staffId} به‌روزرسانی شد`);
    
    // ✅ 2. به‌روزرسانی اطلاعات اصلی Staff
    const updateData: any = {};
    
    const currentFullName = `${editingMember.firstName} ${editingMember.lastName}`.trim();
    if (data.fullName && data.fullName.trim() !== currentFullName) {
      updateData.name = data.fullName.trim();
      console.log(`📝 تغییر نام: ${currentFullName} → ${data.fullName.trim()}`);
    }
    
    if (data.phone && data.phone !== editingMember.phone) {
      updateData.phone = data.phone;
      console.log(`📝 تغییر شماره: ${editingMember.phone} → ${data.phone}`);
    }
    
    if (data.password) {
      updateData.password = data.password;
      console.log(`📝 تغییر رمز عبور: ****`);
    }
    
    // ✅ 3. به‌روزرسانی دپارتمان و نقش
    const selectedDept = departments.find(d => d.id === data.departmentId);
    if (!selectedDept) {
      throw new Error('دپارتمان انتخاب شده یافت نشد');
    }
    
    let realTeamId = teamIdMap.get(selectedDept.name);
    
    if (!realTeamId) {
      const teams = await fetchTeams();
      const foundTeam = teams.find((t: TeamResponse) => t.name === selectedDept.name);
      if (foundTeam) {
        realTeamId = foundTeam.id;
        setTeamIdMap(prev => new Map(prev).set(selectedDept.name, foundTeam.id));
      }
    }
    
    if (!realTeamId) {
      throw new Error(`تیم "${selectedDept.name}" در سرور یافت نشد.`);
    }
    
    // ✅ 4. اگر تغییری در اطلاعات وجود دارد، به‌روزرسانی کن
    if (Object.keys(updateData).length > 0) {
      console.log(`📤 به‌روزرسانی اطلاعات Staff ${staffId}:`, updateData);
      await updateStaff(staffId, updateData);
      console.log(`✅ اطلاعات Staff ${staffId} به‌روزرسانی شد`);
    }
    
    // ✅ 5. اختصاص به دپارتمان جدید (با نقش جدید)
    console.log(`📤 اختصاص Staff ${staffId} به تیم ${realTeamId} با نقش ${data.role}`);
    await assignAgentToTeam(staffId, realTeamId, data.role);
    console.log(`✅ Staff ${staffId} به تیم ${realTeamId} اختصاص یافت`);
    
    // ✅ 6. بارگذاری مجدد داده‌ها
    await loadData();
    
    showSuccess(`عضو "${data.fullName}" با موفقیت ویرایش شد`, "موفقیت ✨");
    
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
// ============================================================

  const handleRemoveMember = async (member: Member) => {
    const fullName = `${member.firstName} ${member.lastName}`;
    
    showConfirm(
      `آیا از حذف "${fullName}" از تیم مطمئن هستید؟`,
      "تایید حذف",
      async () => {
        try {
          setIsSubmitting(true);
          
          const staffId = member.staffId || member.id;
          console.log(`🗑️ حذف Staff با id: ${staffId}`);
          
          await deleteStaff(staffId);
          
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

  const statsData = calculateStats(members);

  return {
    members,
    departments,
    isLoading,
    isSubmitting,
    statsData,
    loadData,
    handleAddMember,
    handleEditMember,
    handleRemoveMember,
  };
}
// ============================================================