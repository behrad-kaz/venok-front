// components/dashboard/members/hooks/useMembers.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { Member, Department, StatsData, AgentResponse, TeamResponse } from "../types";
import {
  getHeadersWithRefresh,
  fetchTeams,
  fetchAgents,
  fetchStaff,
  getStaffCount,
  createStaff,
  createAgent,
  assignAgentToTeam,
  updateAgent,
  deleteAgent,
  deleteStaff,
  updateStaff,
} from "../api/membersApi";
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
  let departmentName = '';
  let role: "مدیر دپارتمان" | "کارمند" = "کارمند";
  
  if (agent.supportAgentTeams && agent.supportAgentTeams.length > 0) {
    const team = agent.supportAgentTeams[0];
    // ✅ استفاده از optional chaining برای جلوگیری از خطا
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
      
      let maxVenokStaffId = 0;
      for (const agent of agents) {
        if (agent.venokStaffId > maxVenokStaffId) {
          maxVenokStaffId = agent.venokStaffId;
        }
      }
      
      const staffCount = await getStaffCount();
      const newCounter = Math.max(maxVenokStaffId, staffCount);
      setVenokStaffCounter(newCounter);
      
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

      const headers = await getHeadersWithRefresh();
      
      const staffResult = await createStaff(fullName, code);
      
      const newVenokStaffId = venokStaffCounter + 1;
      setVenokStaffCounter(newVenokStaffId);

      const agentResult = await createAgent(
        newVenokStaffId,
        fullName,
        headers
      );

      await assignAgentToTeam(agentResult.id, realTeamId, data.role);

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
      
      await updateAgent(editingMember.id, data.status === 'active');
      
      if (data.password) {
        try {
          const staffId = editingMember.staffId;
          if (staffId) {
            await updateStaff(staffId, data.password);
          }
        } catch (staffError) {
          console.warn('⚠️ خطا در به‌روزرسانی Staff، اما ادامه می‌دهیم:', staffError);
        }
      }
      
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
      
      await assignAgentToTeam(editingMember.id, realTeamId, data.role);
      
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

  const handleRemoveMember = async (member: Member) => {
    const fullName = `${member.firstName} ${member.lastName}`;
    
    showConfirm(
      `آیا از حذف "${fullName}" از تیم مطمئن هستید؟`,
      "تایید حذف",
      async () => {
        try {
          setIsSubmitting(true);
          
          await deleteAgent(member.id);
          
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