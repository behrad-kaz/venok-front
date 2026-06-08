"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Users } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { useRoleStore } from "@/stores/useRoleStore";
import { membersData, departments, statsData } from "@/components/dashboard/members/data";
import { Member } from "@/components/dashboard/members/types";
import StatsCards from "@/components/dashboard/members/StatsCards";
import MemberFilters from "@/components/dashboard/members/MemberFilters";
import MemberCard from "@/components/dashboard/members/MemberCard";
import MemberSidebar from "@/components/dashboard/members/MemberSidebar";

// کامپوننت‌های اختصاصی برای مدیر دپارتمان
import DepartmentMemberCard from "@/components/dashboard/members/DepartmentMemberCard";
import DepartmentStatsCards from "@/components/dashboard/members/DepartmentStatsCards";

export default function MembersPage() {
  const { role } = useRoleStore();
  
  // ========== STATE برای مدیر کل ==========
  const [members, setMembers] = useState<Member[]>(membersData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPresence, setSelectedPresence] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // ========== STATE برای مدیر دپارتمان ==========
  const [deptMembers, setDeptMembers] = useState<Member[]>([]);
  const [deptSearchQuery, setDeptSearchQuery] = useState("");
  const [deptPresenceFilter, setDeptPresenceFilter] = useState("all");
  const [deptStatusFilter, setDeptStatusFilter] = useState("all");
  
  // دپارتمان مدیر دپارتمان (در حالت واقعی از پروفایل کاربر می‌آید)
  const managerDepartment = "پشتیبانی";
  const managerName = "امیر حسینی";

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

  const handleAddMember = (data: {
    firstName: string;
    lastName: string;
    username: string;
    phone: string;
    departmentId: number;
    role: "مدیر دپارتمان" | "کارمند";
    status: "active" | "inactive";
    password?: string;
  }) => {
    const department = departments.find(d => d.id === data.departmentId);
    const newMember: Member = {
      id: members.length + 1,
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      phone: data.phone,
      role: data.role,
      departmentId: data.departmentId,
      departmentName: department?.name || "",
      status: data.status,
      presence: "offline",
      lastActivity: "همین الان",
      openTickets: 0,
    };
    setMembers([...members, newMember]);
  };

  const handleEditMember = (data: {
    firstName: string;
    lastName: string;
    username: string;
    phone: string;
    departmentId: number;
    role: "مدیر دپارتمان" | "کارمند";
    status: "active" | "inactive";
  }) => {
    if (editingMember) {
      const department = departments.find(d => d.id === data.departmentId);
      setMembers(
        members.map((m) =>
          m.id === editingMember.id
            ? {
                ...m,
                firstName: data.firstName,
                lastName: data.lastName,
                username: data.username,
                phone: data.phone,
                role: data.role,
                departmentId: data.departmentId,
                departmentName: department?.name || "",
                status: data.status,
              }
            : m
        )
      );
      setEditingMember(null);
    }
  };

  const openEditSidebar = (member: Member) => {
    setEditingMember(member);
    setIsSidebarOpen(true);
  };

  // ========== LOGIC برای مدیر دپارتمان ==========
  useEffect(() => {
    // فیلتر کردن اعضای فقط همان دپارتمان
    let filtered = membersData.filter(
      (member) => member.departmentName === managerDepartment
    );
    
    // اضافه کردن مدیر دپارتمان به لیست اگر نبود
    const hasManager = filtered.some(m => m.role === "مدیر دپارتمان");
    if (!hasManager) {
      const managerMember: Member = {
        id: 99,
        firstName: "امیر",
        lastName: "حسینی",
        username: "amir.hosseini",
        phone: "09129876543",
        role: "مدیر دپارتمان",
        departmentId: 2,
        departmentName: managerDepartment,
        status: "active",
        presence: "online",
        lastActivity: "همین الان",
        openTickets: 3,
      };
      filtered = [managerMember, ...filtered];
    }
    
    setDeptMembers(filtered);
  }, []);

  const filteredDeptMembers = deptMembers.filter((member) => {
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

  // اگر نقش مدیر دپارتمان است، صفحه اختصاصی را نمایش بده
  if (role === "مدیر") {
    return (
      <RoleGuard allowedRoles={["مدیر"]}>
        <DashboardLayout>
          <div className="space-y-6">
            {/* هدر صفحه */}
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">اعضای دپارتمان</h1>
              <p className="text-sm text-gray-500">لیست و مدیریت اعضای دپارتمان {managerDepartment}</p>
            </div>

            {/* جستجو */}
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

            {/* فیلترهای حضور و وضعیت */}
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

            {/* کارت‌های آمار دپارتمان */}
            <DepartmentStatsCards stats={deptStats} />

            {/* لیست اعضای دپارتمان */}
            <div className="space-y-4">
              {filteredDeptMembers.map((member, index) => (
                <DepartmentMemberCard key={member.id} member={member} index={index} />
              ))}
            </div>

            {/* پیام خالی بودن لیست */}
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

  // برای مدیر کل، صفحه اصلی اعضا را نمایش بده
  if (role === "مدیر کل") {
    return (
      <RoleGuard allowedRoles={["مدیر کل"]}>
        <DashboardLayout>
          <div className="space-y-6">
            {/* جستجو و دکمه افزودن */}
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
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن عضو جدید</span>
              </button>
            </div>

            {/* فیلترها */}
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

            {/* کارت‌های آمار */}
            <StatsCards stats={statsData} />

            {/* لیست اعضا */}
            <div className="space-y-4">
              {filteredMembers.map((member, index) => (
                <MemberCard key={member.id} member={member} index={index} onEdit={openEditSidebar} />
              ))}
            </div>
          </div>

          {/* سایدبار افزودن/ویرایش عضو */}
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
          />
        </DashboardLayout>
      </RoleGuard>
    );
  }

  // برای کارمند
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