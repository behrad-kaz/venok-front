// app/dashboard/members/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Plus, Users, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { useRoleStore } from "@/stores/useRoleStore";
import { Member } from "@/components/dashboard/members/types";
import StatsCards from "@/components/dashboard/members/StatsCards";
import MemberFilters from "@/components/dashboard/members/MemberFilters";
import MemberCard from "@/components/dashboard/members/MemberCard";
import MemberSidebar from "@/components/dashboard/members/MemberSidebar";
import DepartmentMemberCard from "@/components/dashboard/members/DepartmentMemberCard";
import DepartmentStatsCards from "@/components/dashboard/members/DepartmentStatsCards";
import MemberRequestModal from "@/components/dashboard/members/MemberRequestModal";
import { useMembers } from "@/components/dashboard/members/hooks/useMembers";
import { authService } from "@/services/auth.service";
import { api } from "@/services/api-client";

export default function MembersPage() {
  const { role } = useRoleStore();
  const searchParams = useSearchParams();
  const departmentParam = searchParams.get('department');
  
  const {
    members,
    departments,
    isLoading,
    isSubmitting,
    statsData,
    handleAddMember,
    handleEditMember,
    handleRemoveMember,
  } = useMembers();
  
  // Stateهای محلی برای فیلترها و سایدبار
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(departmentParam || "all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPresence, setSelectedPresence] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isMemberRequestOpen, setIsMemberRequestOpen] = useState(false);
  
  // ✅ دریافت departmentId کاربر جاری از localStorage
  const [currentUserDepartmentId, setCurrentUserDepartmentId] = useState<number | null>(null);
  const [currentUserDepartmentName, setCurrentUserDepartmentName] = useState<string>("");
  
  // بارگذاری اطلاعات دپارتمان کاربر جاری
  useEffect(() => {
    const loadUserDepartment = async () => {
      try {
        const staffId = authService.getStaffId();
        if (!staffId) {
          console.warn('⚠️ staffId وجود ندارد');
          return;
        }
        
        // دریافت اطلاعات staff از API
        const response = await api.get<{ 
          id: number; 
          departmentId: number | null; 
          role: string; 
          name: string;
          department?: { id: number; name: string; color: string };
        }>(`/staff/${staffId}`);
        
        if (response.departmentId) {
          setCurrentUserDepartmentId(response.departmentId);
          setCurrentUserDepartmentName(response.department?.name || '');
          console.log(`✅ دپارتمان کاربر جاری: ${response.department?.name} (${response.departmentId})`);
        } else {
          console.warn('⚠️ کاربر جاری دپارتمان ندارد');
        }
      } catch (error) {
        console.error('❌ خطا در دریافت اطلاعات دپارتمان کاربر:', error);
      }
    };
    
    if (role === 'مدیر') {
      loadUserDepartment();
    }
  }, [role]);

  // برای مدیر دپارتمان
  const [deptSearchQuery, setDeptSearchQuery] = useState("");
  const [deptPresenceFilter, setDeptPresenceFilter] = useState("all");
  const [deptStatusFilter, setDeptStatusFilter] = useState("all");
  
  // ✅ برای مدیر دپارتمان، از departmentId واقعی کاربر استفاده کن
  const managerDepartmentName = currentUserDepartmentName || "پشتیبانی";
  const managerDepartmentId = currentUserDepartmentId;

  // ✅ وقتی پارامتر department از URL تغییر کرد، selectedDepartment رو به‌روز کن
  useEffect(() => {
    if (departmentParam) {
      setSelectedDepartment(departmentParam);
    }
  }, [departmentParam]);

  // فیلتر کردن اعضا
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

  // فیلتر کردن اعضا برای مدیر دپارتمان
  const filteredDeptMembers = members.filter((member) => {
    // ✅ فقط اعضایی که دپارتمان آنها برابر با دپارتمان مدیر است
    if (member.departmentId !== managerDepartmentId) return false;
    
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


  const openEditSidebar = (member: Member) => {
    setEditingMember(member);
    setIsSidebarOpen(true);
  };

  // نمایش لودینگ تا زمانی که دپارتمان کاربر بارگذاری شود
  if (role === 'مدیر' && isLoading) {
    return (
      <RoleGuard allowedRoles={["مدیر کل", "مدیر"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#59D8C3] animate-spin" />
            <span className="mr-3 text-gray-400">در حال بارگذاری اطلاعات...</span>
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

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
    // ✅ اگر هنوز دپارتمان کاربر مشخص نشده، پیام مناسب نمایش بده
    if (!managerDepartmentId) {
      return (
        <RoleGuard allowedRoles={["مدیر"]}>
          <DashboardLayout>
            <div className="text-center py-12">
              <p className="text-gray-400">در حال بارگذاری اطلاعات دپارتمان شما...</p>
            </div>
          </DashboardLayout>
        </RoleGuard>
      );
    }

    return (
      <RoleGuard allowedRoles={["مدیر"]}>
        <DashboardLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">اعضای دپارتمان</h1>
              <p className="text-sm text-gray-500">لیست و مدیریت اعضای دپارتمان {managerDepartmentName}</p>
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
              <button
                onClick={() => setIsMemberRequestOpen(true)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all whitespace-nowrap"
              >
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

            <DepartmentStatsCards />

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

            <MemberRequestModal
              isOpen={isMemberRequestOpen}
              onClose={() => setIsMemberRequestOpen(false)}
              members={filteredDeptMembers}
              departmentName={managerDepartmentName}
              managerName={currentUserDepartmentName || authService.getStaffName() || "مدیر دپارتمان"}
            />
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
                  onDelete={() => handleRemoveMember(member)}
                />
              ))}
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-dashed border-[rgba(255,255,255,0.1)]">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">هیچ عضوی یافت نشد</p>
                <p className="text-xs text-gray-500 mt-1">برای افزودن عضو جدید، روی دکمه &quot;+&quot; کلیک کنید.</p>
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
            onSave={(data) => {
              if (editingMember) {
                handleEditMember(data, editingMember);
              } else {
                handleAddMember(data);
              }
            }}
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