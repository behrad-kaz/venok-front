// components/onboarding/steps/Step3Members.tsx

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Trash2, UserPlus, AlertTriangle, ChevronDown, Loader2 } from "lucide-react";
import { Member, Department } from "../types";
import { useModal } from "@/components/ui/modal";

interface Step3MembersProps {
  members: Member[];
  departments: Department[];
  onAddMember: (member: Omit<Member, "id">) => void;
  onRemoveMember: (id: string) => void;
  onLoadMembers?: (members: Member[]) => void;
}

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
}

interface AssignTeamResponse {
  id: number;
  agentId: number;
  teamId: number;
  role: string;
  createdAt: string;
}

interface StaffResponse {
  id: number;
  organizationId: number;
  userId: number;
  name: string;
  code: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ✅ تابع دریافت هدرها با رفرش خودکار توکن
const getHeadersWithRefresh = async (): Promise<Record<string, string>> => {
  let accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  const contextToken = typeof window !== 'undefined' ? localStorage.getItem('contextToken') : null;
  
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
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        console.log('✅ توکن با موفقیت رفرش شد');
      } else {
        console.error('❌ رفرش توکن ناموفق:', response.status);
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

export default function Step3Members({
  members,
  departments,
  onAddMember,
  onRemoveMember,
  onLoadMembers,
}: Step3MembersProps) {
  const { showWarning, showError, showSuccess, showConfirm } = useModal();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agentIdMap, setAgentIdMap] = useState<Map<string, number>>(new Map());
  const [teamIdMap, setTeamIdMap] = useState<Map<string, number>>(new Map());
  const [venokStaffCounter, setVenokStaffCounter] = useState<number>(0);
  const [staffIdMap, setStaffIdMap] = useState<Map<number, number>>(new Map());
  
  // ✅ ref برای جلوگیری از حذف دوباره
  const isDeletingRef = useRef<Set<string>>(new Set());
  
  const [newMember, setNewMember] = useState({
    fullName: "",
    phone: "",
    password: "",
    departmentId: "",
    role: "staff" as "manager" | "staff",
  });

  // پیدا کردن دپارتمان‌هایی که مدیر ندارند
  const departmentsWithoutManager = useMemo(() => {
    const departmentsWithManager = members
      .filter((m) => m.role === "manager")
      .map((m) => m.departmentId);

    return departments.filter(
      (dept) => !departmentsWithManager.includes(dept.id),
    );
  }, [departments, members]);

  // ✅ تابع تولید code یکتا
  const generateUniqueCode = (phone: string): string => {
    const phonePrefix = phone.replace(/\D/g, '').substring(0, 3) || '123';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 900 + 100).toString();
    return `${phonePrefix}${timestamp}${random}`;
  };

  // ✅ تابع دریافت تعداد staffهای موجود
  const getStaffCount = async (): Promise<number> => {
    try {
      const headers = await getHeadersWithRefresh();
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

  // ✅ تابع ایجاد Staff
  const createStaff = async (name: string, code: string): Promise<StaffResponse> => {
    console.log('📤 ایجاد Staff در /staff...');
    
    const headers = await getHeadersWithRefresh();
    
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
    
    console.log('📤 ارسال به سرور (POST /staff):', staffData);
    
    const response = await fetch('http://localhost:3001/staff', {
      method: 'POST',
      headers,
      body: JSON.stringify(staffData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ خطا در ایجاد Staff: ${response.status} - ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const result: StaffResponse = await response.json();
    console.log('✅ Staff ایجاد شد:', result);
    
    return result;
  };

  // ✅ تابع ایجاد Agent
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
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ اپراتور ایجاد شد:', result);
    return result;
  };

  // ✅ بارگذاری اعضای موجود از سرور
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 شروع بارگذاری اطلاعات از سرور...');
        
        const headers = await getHeadersWithRefresh();
        
        // 1. دریافت لیست تیم‌ها
        const teamsResponse = await fetch('http://localhost:3004/support/team', {
          method: 'GET',
          headers,
        });

        if (teamsResponse.ok) {
          const teams = await teamsResponse.json() as any[];
          const teamMap = new Map<string, number>();
          teams.forEach((team: any) => {
            teamMap.set(team.name, team.id);
          });
          setTeamIdMap(teamMap);
          console.log('✅ تیم‌های موجود:', teamMap);
        }

        // 2. دریافت لیست اپراتورها
        console.log('📡 دریافت اپراتورها از /support/agent...');
        const agentsResponse = await fetch('http://localhost:3004/support/agent', {
          method: 'GET',
          headers,
        });

        if (agentsResponse.ok) {
          const agents = await agentsResponse.json() as AgentResponse[];
          console.log(`✅ ${agents.length} اپراتور دریافت شد`);
          
          const agentMap = new Map<string, number>();
          const staffMap = new Map<number, number>();
          const loadedMembers: Member[] = [];
          let maxVenokStaffId = 0;
          
          for (const agent of agents) {
            if (!agent.isActive || agent.deletedAt) {
              continue;
            }
            
            agentMap.set(agent.id.toString(), agent.id);
            
            if (agent.venokStaffId > maxVenokStaffId) {
              maxVenokStaffId = agent.venokStaffId;
            }
            
            // ✅ دریافت staffId مربوطه
            try {
              const staffResponse = await fetch(`http://localhost:3001/staff/${agent.venokStaffId}`, {
                method: 'GET',
                headers,
              });
              if (staffResponse.ok) {
                const staffData = await staffResponse.json();
                staffMap.set(agent.id, staffData.id);
                console.log(`✅ staffId ${staffData.id} → agentId ${agent.id}`);
              }
            } catch (error) {
              console.warn(`⚠️ خطا در دریافت staff برای venokStaffId ${agent.venokStaffId}:`, error);
            }
            
            const name = agent.venokStaff?.name || `کاربر ${agent.id}`;
            const nameParts = name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            let departmentName = '';
            let departmentId = '';
            let role: 'manager' | 'staff' = 'staff';
            
            if (agent.supportAgentTeams && agent.supportAgentTeams.length > 0) {
              const team = agent.supportAgentTeams[0];
              if (team.team) {
                departmentName = team.team.name;
                const dept = departments.find(d => d.name === team.team.name);
                if (dept) {
                  departmentId = dept.id;
                }
              }
              role = team.role === 'lead' ? 'manager' : 'staff';
            }
            
            if (departmentId) {
              loadedMembers.push({
                id: agent.id.toString(),
                firstName,
                lastName,
                username: `user${agent.id}`,
                phone: '',
                password: '',
                departmentId: departmentId,
                departmentName: departmentName,
                role: role,
                status: 'active' as const,
                presence: 'offline' as const,
                lastActivity: 'همین الان',
                openTickets: 0,
              });
            }
          }
          
          setAgentIdMap(agentMap);
          setStaffIdMap(staffMap);
          console.log('✅ agentIdMap:', agentMap);
          console.log('✅ staffIdMap:', staffMap);
          
          const staffCount = await getStaffCount();
          const newCounter = Math.max(maxVenokStaffId, staffCount);
          setVenokStaffCounter(newCounter);
          console.log(`✅ venokStaffCounter تنظیم شد: ${newCounter}`);
          
          if (onLoadMembers && loadedMembers.length > 0) {
            console.log(`✅ ${loadedMembers.length} عضو بارگذاری شد`);
            onLoadMembers(loadedMembers);
          }
        }

      } catch (error) {
        console.error('❌ خطا در دریافت اطلاعات:', error);
      } finally {
        setIsLoading(false);
        console.log('🔄 بارگذاری اطلاعات کامل شد');
      }
    };

    if (members.length === 0) {
      loadExistingData();
    }
  }, [departments, onLoadMembers, members.length]);

  const handleSubmit = async () => {
    console.log('📝 شروع فرآیند افزودن عضو جدید...');
    
    if (
      !newMember.fullName ||
      !newMember.phone ||
      !newMember.password ||
      !newMember.departmentId
    ) {
      console.warn('⚠️ فیلدهای اجباری پر نشده‌اند');
      showWarning("لطفاً تمام فیلدهای الزامی را پر کنید");
      return;
    }
    if (newMember.password.length < 8) {
      console.warn('⚠️ رمز عبور کمتر از ۸ کاراکتر');
      showWarning("رمز عبور باید حداقل ۸ کاراکتر باشد");
      return;
    }

    setIsSubmitting(true);
    console.log('🔄 شروع ارسال درخواست...');

    try {
      const headers = await getHeadersWithRefresh();
      
      const selectedDept = departments.find(
        (d) => d.id === newMember.departmentId,
      );

      if (!selectedDept) {
        console.error('❌ دپارتمان انتخاب شده یافت نشد');
        throw new Error('دپارتمان انتخاب شده یافت نشد');
      }
      console.log(`📌 دپارتمان انتخاب شده: ${selectedDept.name} (${selectedDept.id})`);

      let realTeamId = teamIdMap.get(selectedDept.name);
      
      if (!realTeamId) {
        console.log('🔄 تیم در کش یافت نشد، دریافت از API...');
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
        console.error(`❌ تیم "${selectedDept.name}" در سرور یافت نشد`);
        throw new Error(`تیم "${selectedDept.name}" در سرور یافت نشد.`);
      }

      console.log(`✅ teamId واقعی برای "${selectedDept.name}": ${realTeamId}`);

      // ✅ مرحله 1: ایجاد Staff
      const code = generateUniqueCode(newMember.phone);
      const staffResult = await createStaff(newMember.fullName, code);
      console.log(`✅ Staff ایجاد شد با id: ${staffResult.id}`);
      
      const newVenokStaffId = venokStaffCounter + 1;
      setVenokStaffCounter(newVenokStaffId);
      console.log(`✅ venokStaffId جدید: ${newVenokStaffId}`);

      // ✅ مرحله 2: ایجاد Agent
      const agentResult = await createAgent(
        newVenokStaffId,
        newMember.fullName,
        headers
      );
      console.log(`✅ اپراتور ایجاد شد با id: ${agentResult.id}`);

      const agentId = agentResult.id;

      // ✅ ذخیره mapping
      setStaffIdMap(prev => new Map(prev).set(agentId, staffResult.id));

      // ✅ مرحله 3: اختصاص به دپارتمان
      const assignData = {
        teamId: realTeamId,
        role: newMember.role === "manager" ? "lead" : "member",
      };

      console.log(`📤 ارسال به سرور (POST /support/agent/${agentId}/team):`, assignData);

      const assignResponse = await fetch(`http://localhost:3004/support/agent/${agentId}/team`, {
        method: 'POST',
        headers,
        body: JSON.stringify(assignData),
      });

      if (!assignResponse.ok) {
        const errorText = await assignResponse.text();
        console.error(`❌ خطا در تخصیص به دپارتمان: ${assignResponse.status} - ${errorText}`);
        throw new Error(`HTTP error! status: ${assignResponse.status} - ${errorText}`);
      }

      const assignResult = await assignResponse.json() as AssignTeamResponse;
      console.log('✅ تخصیص به دپارتمان موفق:', assignResult);

      // ✅ مرحله 4: افزودن به لیست محلی
      const nameParts = newMember.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const autoUsername = newMember.fullName
        .toLowerCase()
        .replace(/\s/g, "")
        .replace(/[^a-zA-Z0-9]/g, "");

      const tempId = agentId.toString();

      setAgentIdMap(prev => new Map(prev).set(tempId, agentId));

      onAddMember({
        id: tempId,
        firstName: firstName,
        lastName: lastName,
        username: autoUsername || `user${tempId}`,
        phone: newMember.phone,
        password: newMember.password,
        departmentId: selectedDept.id,
        departmentName: selectedDept.name,
        role: newMember.role,
        status: 'active' as const,
        presence: 'offline' as const,
        lastActivity: 'همین الان',
        openTickets: 0,
      });

      showSuccess(`عضو "${newMember.fullName}" با موفقیت اضافه شد`, "موفقیت ✨");

      setNewMember({
        fullName: "",
        phone: "",
        password: "",
        departmentId: "",
        role: "staff",
      });
      setShowForm(false);
      
      console.log('✅ فرآیند افزودن عضو با موفقیت کامل شد');

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

  const handleRemoveMember = async (id: string) => {
    // ✅ ابتدا بررسی کن که عضو هنوز در لیست وجود داره
    const memberToRemove = members.find((m) => m.id === id);
    if (!memberToRemove) {
      console.log(`⚠️ عضو با id ${id} قبلاً حذف شده است`);
      return;
    }
    
    // ✅ جلوگیری از حذف دوباره
    if (isDeletingRef.current.has(id)) {
      console.log(`⏳ حذف عضو ${id} در حال انجام است، صرف نظر...`);
      return;
    }
    
    console.log(`🗑️ شروع فرآیند حذف عضو با id: ${id}`);
    
    const fullName = `${memberToRemove.firstName || ''} ${memberToRemove.lastName || ''}`.trim() || memberToRemove.username;
    console.log(`📌 عضو مورد نظر: ${fullName}`);

    // ✅ اضافه کردن به set برای جلوگیری از حذف دوباره
    isDeletingRef.current.add(id);

    showConfirm(
      `آیا از حذف "${fullName}" از تیم مطمئن هستید؟`,
      "تایید حذف",
      async () => {
        try {
          const headers = await getHeadersWithRefresh();
          
          // ✅ بررسی کن که agentId هنوز در map وجود داره
          let agentId = agentIdMap.get(id);
          
          console.log(`🔍 agentId از map: ${agentId}`);
          
          if (!agentId) {
            console.warn(`⚠️ agentId برای memberId ${id} در map یافت نشد، استفاده از id`);
            agentId = parseInt(id);
          }

          const staffId = staffIdMap.get(agentId);
          console.log(`🔍 staffId مربوط به agent ${agentId}: ${staffId}`);

          // ✅ مرحله 1: حذف از support_agent
          console.log(`🗑️ حذف اپراتور با agentId: ${agentId} (memberId: ${id})`);
          
          const agentResponse = await fetch(`http://localhost:3004/support/agent/${agentId}`, {
            method: 'DELETE',
            headers,
          });

          // ✅ اگر 404 برگشت، یعنی قبلاً حذف شده، پس ادامه بده
          if (agentResponse.status === 404) {
            console.log(`⚠️ اپراتور با agentId ${agentId} قبلاً حذف شده است`);
          } else if (!agentResponse.ok) {
            const errorText = await agentResponse.text();
            console.error(`❌ خطا در حذف اپراتور: ${agentResponse.status} - ${errorText}`);
            throw new Error(`HTTP error! status: ${agentResponse.status} - ${errorText}`);
          } else {
            const agentResult = await agentResponse.json();
            console.log('✅ اپراتور با موفقیت حذف شد:', agentResult);
          }

          // ✅ مرحله 2: حذف از staff
          if (staffId) {
            console.log(`🗑️ حذف staff با id: ${staffId}`);
            
            try {
              const staffResponse = await fetch(`http://localhost:3001/staff/${staffId}`, {
                method: 'DELETE',
                headers,
              });

              if (staffResponse.status === 404) {
                console.log(`⚠️ staff با id ${staffId} قبلاً حذف شده است`);
              } else if (staffResponse.ok) {
                const staffResult = await staffResponse.json();
                console.log('✅ staff با موفقیت حذف شد:', staffResult);
              } else {
                console.warn(`⚠️ خطا در حذف staff: ${staffResponse.status}`);
              }
            } catch (staffError) {
              console.warn('⚠️ خطا در حذف staff:', staffError);
            }
          }

          // ✅ حذف از mapping‌ها
          setAgentIdMap(prev => {
            const newMap = new Map(prev);
            newMap.delete(id);
            return newMap;
          });

          setStaffIdMap(prev => {
            const newMap = new Map(prev);
            newMap.delete(agentId);
            return newMap;
          });

          // ✅ حذف از لیست members (والد) - این باعث میشه عضو از UI حذف بشه
          // مطمئن میشیم که id درست ارسال بشه
          console.log(`🗑️ حذف عضو ${id} از لیست members (والد)`);
          onRemoveMember(id);
          
          // ✅ حذف از set برای جلوگیری از حذف دوباره
          isDeletingRef.current.delete(id);
          
          showSuccess(`عضو "${fullName}" با موفقیت حذف شد`, "موفقیت ✨");
          console.log(`✅ عضو "${fullName}" با موفقیت حذف شد`);

        } catch (error) {
          console.error('❌ خطا در حذف عضو:', error);
          // ✅ در صورت خطا، از set حذف کن تا دوباره تلاش شود
          isDeletingRef.current.delete(id);
          showError(
            error instanceof Error ? error.message : "خطا در حذف عضو",
            "خطا"
          );
        }
      },
      () => {
        // ✅ در صورت انصراف کاربر، از set حذف کن
        isDeletingRef.current.delete(id);
      }
    );
  };

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return `${first}${last}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#59D8C3] animate-spin" />
        <span className="mr-3 text-gray-400">در حال بارگذاری اطلاعات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {departmentsWithoutManager.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(242,184,75,0.08)] border border-[rgba(242,184,75,0.2)]">
          <AlertTriangle className="w-4 h-4 text-[#f2b84b] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-white mb-1">
              توجه: دپارتمان‌های بدون مدیر
            </p>
            <p className="text-xs text-gray-400">
              دپارتمان‌های زیر مدیر ندارند:{" "}
              {departmentsWithoutManager.map((d) => d.name).join("، ")}
            </p>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full p-4 rounded-xl border-2 border-dashed border-[rgba(255,255,255,0.1)] hover:border-[#59D8C3] hover:bg-[rgba(89,216,195,0.04)] transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:text-[#59D8C3]"
        >
          <UserPlus className="w-4 h-4" />
          افزودن عضو جدید
        </button>
      )}

      {showForm && (
        <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
          <h4 className="text-sm font-semibold text-white mb-4">
            افزودن عضو جدید
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                نام و نام خانوادگی <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={newMember.fullName}
                onChange={(e) =>
                  setNewMember({ ...newMember, fullName: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                placeholder="مثال: علی محمدی"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                شماره همراه <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={newMember.phone}
                onChange={(e) =>
                  setNewMember({ ...newMember, phone: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                رمز عبور اولیه <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={newMember.password}
                onChange={(e) =>
                  setNewMember({ ...newMember, password: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                placeholder="حداقل ۸ کاراکتر"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                دپارتمان <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={newMember.departmentId}
                  onChange={(e) =>
                    setNewMember({ ...newMember, departmentId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white focus:outline-none focus:border-[#59D8C3] transition-colors appearance-none cursor-pointer"
                >
                  <option value="" className="text-gray-500">
                    انتخاب کنید
                  </option>
                  {departments.map((dept, index) => (
                    <option
                      key={`dept-${dept.id}-${index}`}
                      value={dept.id}
                      className="text-white bg-[#0D1B17]"
                    >
                      {dept.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-2">
                نقش در دپارتمان <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-3">
                <label
                  className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border transition-colors flex-1 ${newMember.role === "manager" ? "border-[#59D8C3] bg-[rgba(89,216,195,0.05)]" : "border-[rgba(255,255,255,0.1)]"}`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={newMember.role === "manager"}
                    onChange={() =>
                      setNewMember({ ...newMember, role: "manager" })
                    }
                    className="w-4 h-4 text-[#59D8C3]"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      مدیر دپارتمان
                    </p>
                    <p className="text-xs text-gray-500">
                      دسترسی مدیریت و نظارت
                    </p>
                  </div>
                </label>
                <label
                  className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border transition-colors flex-1 ${newMember.role === "staff" ? "border-[#59D8C3] bg-[rgba(89,216,195,0.05)]" : "border-[rgba(255,255,255,0.1)]"}`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={newMember.role === "staff"}
                    onChange={() =>
                      setNewMember({ ...newMember, role: "staff" })
                    }
                    className="w-4 h-4 text-[#59D8C3]"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      کارمند پشتیبانی
                    </p>
                    <p className="text-xs text-gray-500">پاسخگویی به تیکت‌ها</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-[rgba(255,255,255,0.1)]">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
            >
              انصراف
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  در حال افزودن...
                </>
              ) : (
                'افزودن عضو'
              )}
            </button>
          </div>
        </div>
      )}

      {members.length > 0 && (
        <div className="space-y-3">
          {members.map((member) => {
            const realAgentId = agentIdMap.get(member.id) || parseInt(member.id);
            
            return (
              <div
                key={member.id}
                className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(89,216,195,0.3)] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="relative flex-shrink-0">
                      <div className="rounded-xl inline-flex items-center justify-center font-semibold bg-[rgba(89,216,195,0.14)] text-[#59D8C3] border border-[rgba(89,216,195,0.2)] w-9 h-9 text-xs">
                        {getInitials(member.firstName, member.lastName)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-semibold text-white">
                        {member.firstName} {member.lastName}
                      </h5>
                      <p className="text-xs text-gray-500" dir="ltr">
                        @{member.username} (Agent ID: {realAgentId})
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            member.role === "manager"
                              ? "bg-[rgba(89,216,195,0.1)] text-[#59D8C3] border-[rgba(89,216,195,0.2)]"
                              : "bg-[rgba(255,255,255,0.05)] text-gray-400 border-[rgba(255,255,255,0.1)]"
                          }`}
                        >
                          {member.role === "manager"
                            ? "مدیر دپارتمان"
                            : "کارمند پشتیبانی"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(255,255,255,0.05)] text-gray-400 border border-[rgba(255,255,255,0.1)]">
                          {member.departmentName}
                        </span>
                        <span className="text-[10px] text-gray-500" dir="ltr">
                          {member.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-[rgba(255,107,107,0.08)] transition-colors flex-shrink-0"
                    title="حذف عضو"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {members.length === 0 && (
        <div className="p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-dashed border-[rgba(255,255,255,0.1)] text-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mx-auto mb-3 text-gray-500"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p className="text-sm text-gray-400 mb-1">هنوز عضوی اضافه نشده</p>
          <p className="text-xs text-gray-500">
            اعضای تیم پشتیبانی خود را اضافه کنید.
          </p>
        </div>
      )}
    </div>
  );
}