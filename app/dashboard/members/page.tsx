// app/dashboard/members/page.tsx
"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Link from "next/link";
import MembersTable from "@/components/dashboard/members/MembersTable";
import MemberCard from "@/components/dashboard/members/MemberCard";
import MembersFilters from "@/components/dashboard/members/MembersFilters";
import AddMemberModal from "@/components/dashboard/members/AddMemberModal";
import EditMemberModal from "@/components/dashboard/members/EditMemberModal";
import ChangePasswordModal from "@/components/dashboard/members/ChangePasswordModal";
import DeactivateMemberModal from "@/components/dashboard/members/DeactivateMemberModal";
import DeleteMemberModal from "@/components/dashboard/members/DeleteMemberModal";
import { Member } from "@/components/dashboard/members/types";
import { useRoleStore } from "@/stores/useRoleStore";
import RoleGuard from "@/components/dashboard/RoleGuard";

// دپارتمان مدیران (در حالت واقعی از API می‌آید)
const getManagerDepartment = (role: string, name: string): string => {
  // برای نمونه، فرض می‌کنیم سارا محمدی مدیر حسابداری است
  if (name === "سارا محمدی") return "حسابداری";
  if (name === "علی احمدی") return "سفرهای داخلی";
  if (name === "نیلوفر کریمی") return "سفرهای خارجی";
  if (name === "رضا نادری") return "پشتیبانی فنی";
  return "حسابداری";
};

const allMembersData: Member[] = [
  { id: 1, name: "مریم رضایی", username: "maryam.rezaei", role: "مدیر کل", department: "همه دپارتمان‌ها", status: "online", tickets: 0, lastActivity: "همین الان" },
  { id: 2, name: "سارا محمدی", username: "sara.m", role: "مدیر دپارتمان", department: "حسابداری", status: "online", tickets: 4, lastActivity: "۵ دقیقه پیش" },
  { id: 3, name: "علی احمدی", username: "ali.a", role: "مدیر دپارتمان", department: "سفرهای داخلی", status: "offline", tickets: 6, lastActivity: "۲ ساعت پیش" },
  { id: 4, name: "نیلوفر کریمی", username: "niloo.k", role: "مدیر دپارتمان", department: "سفرهای خارجی", status: "online", tickets: 3, lastActivity: "۱۰ دقیقه پیش" },
  { id: 5, name: "امیر حسینی", username: "amir.h", role: "کارمند پشتیبانی", department: "حسابداری", status: "online", tickets: 5, lastActivity: "همین الان" },
  { id: 6, name: "الهام کاظمی", username: "elham.k", role: "کارمند پشتیبانی", department: "سفرهای داخلی", status: "offline", tickets: 3, lastActivity: "۱ ساعت پیش" },
  { id: 7, name: "رضا نادری", username: "reza.n", role: "مدیر دپارتمان", department: "پشتیبانی فنی", status: "online", tickets: 2, lastActivity: "۲۰ دقیقه پیش" },
  { id: 8, name: "احمد کریمی", username: "ahmad.k", role: "کارمند پشتیبانی", department: "حسابداری", status: "online", tickets: 2, lastActivity: "۳۰ دقیقه پیش" },
  { id: 9, name: "زهرا محمدی", username: "zahra.m", role: "کارمند پشتیبانی", department: "حسابداری", status: "offline", tickets: 1, lastActivity: "۳ ساعت پیش" },
];

const getInitials = (name: string) => {
  const names = name.split(" ");
  if (names.length >= 2) return `${names[0].charAt(0)}${names[1].charAt(0)}`;
  return name.charAt(0);
};

export default function MembersPage() {
  const { role } = useRoleStore();
  const [userName, setUserName] = useState("سارا محمدی"); // در حالت واقعی از احراز هویت می‌آید
  
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // مودال‌ها
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // فرم‌ها
  const [newMember, setNewMember] = useState({ 
    name: "", 
    username: "", 
    password: "", 
    confirmPassword: "", 
    department: "", 
    role: "",
    status: "active" 
  });
  
  const [editMember, setEditMember] = useState({ 
    name: "", 
    username: "", 
    department: "", 
    role: "",
    status: "active" 
  });
  
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });

  // فیلتر کردن اعضا بر اساس نقش و دپارتمان
  useEffect(() => {
    let filteredMembers = [...allMembersData];
    
    if (role === "مدیر") {
      const managerDepartment = getManagerDepartment(role, userName);
      // مدیر فقط اعضای دپارتمان خود را می‌بیند
      filteredMembers = filteredMembers.filter(m => 
        m.department === managerDepartment || m.role === "مدیر کل"
      );
    }
    
    setMembers(filteredMembers);
  }, [role, userName]);

  const filteredMembers = members.filter((m) => {
    const matchesSearch = searchQuery === "" || m.name.includes(searchQuery) || m.username.includes(searchQuery);
    const matchesRole = roleFilter === "all" || m.role === roleFilter;
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddMember = () => {
    if (!newMember.name || !newMember.username || !newMember.password || !newMember.department || !newMember.role) return;
    if (newMember.password !== newMember.confirmPassword) { alert("رمز عبور مطابقت ندارد"); return; }
    
    const managerDepartment = role === "مدیر" ? getManagerDepartment(role, userName) : newMember.department;
    
    setMembers([...members, { 
      id: members.length + 1, 
      name: newMember.name, 
      username: newMember.username, 
      role: newMember.role as any, 
      department: role === "مدیر" ? managerDepartment : newMember.department, 
      status: newMember.status === "active" ? "online" : "offline", 
      tickets: 0, 
      lastActivity: "همین الان" 
    }]);
    setIsAddModalOpen(false);
    setNewMember({ name: "", username: "", password: "", confirmPassword: "", department: "", role: "", status: "active" });
  };

  const handleEditMember = () => {
    if (!selectedMember) return;
    setMembers(members.map(m => m.id === selectedMember.id ? { 
      ...m, 
      name: editMember.name,
      username: editMember.username,
      department: editMember.department,
      role: editMember.role as any,
      status: editMember.status === "active" ? "online" : "offline"
    } : m));
    setIsEditModalOpen(false);
    setSelectedMember(null);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) { alert("رمز عبور مطابقت ندارد"); return; }
    console.log("تغییر رمز برای:", selectedMember?.name);
    setIsPasswordModalOpen(false);
    setPasswordData({ newPassword: "", confirmPassword: "" });
  };

  const handleDeactivate = () => { 
    setIsDeactivateModalOpen(false); 
    setSelectedMember(null); 
  };
  
  const handleDelete = () => { 
    if (selectedMember) setMembers(members.filter(m => m.id !== selectedMember.id)); 
    setIsDeleteModalOpen(false); 
    setSelectedMember(null); 
  };

  const openEditModal = (m: Member) => { 
    setSelectedMember(m); 
    setEditMember({ 
      name: m.name, 
      username: m.username, 
      department: m.department, 
      role: m.role,
      status: m.status === "online" ? "active" : "inactive"
    }); 
    setIsEditModalOpen(true); 
  };
  
  const openPasswordModal = (m: Member) => { 
    setSelectedMember(m); 
    setPasswordData({ newPassword: "", confirmPassword: "" }); 
    setIsPasswordModalOpen(true); 
  };
  
  const openDeactivateModal = (m: Member) => { 
    setSelectedMember(m); 
    setIsDeactivateModalOpen(true); 
  };
  
  const openDeleteModal = (m: Member) => { 
    setSelectedMember(m); 
    setIsDeleteModalOpen(true); 
  };

  // عنوان صفحه بر اساس نقش
  const getPageTitle = () => {
    if (role === "مدیر") {
      const department = getManagerDepartment(role, userName);
      return {
        title: "مدیریت اعضا",
        description: `اعضای دپارتمان ${department}`,
      };
    }
    return {
      title: "مدیریت اعضا",
      description: "مدیریت تمامی اعضای سازمان",
    };
  };

  const pageTitle = getPageTitle();

  return (
     <RoleGuard allowedRoles={["مدیر کل", "مدیر"]}>
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="relative mb-6">
          <Link href="/" className="absolute top-0 left-0 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[#59D8C3]/20 text-[11px] text-gray-400 hover:text-white hover:border-[#59D8C3]/40 transition-all duration-300">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg><span>صفحه اصلی</span>
          </Link>
          <div className="pt-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">{pageTitle.title}</h1>
                <p className="text-gray-400 text-sm mt-0.5">{pageTitle.description} • {filteredMembers.length} عضو</p>
              </div>
              {role !== "مدیر" && (
                <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm">+ افزودن عضو</button>
              )}
            </div>

            {/* هشدار برای نقش مدیر */}
            {role === "مدیر" && (
              <div className="flex items-center gap-2 px-4 py-2.5 mt-4 rounded-xl bg-[#59D8C3]/10 border border-[#59D8C3]/20 text-xs text-gray-400">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#59d8c3" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                شما فقط اعضای دپارتمان خودتان را می‌بینید.
              </div>
            )}

            <MembersFilters 
              searchQuery={searchQuery} 
              onSearchChange={setSearchQuery} 
              roleFilter={roleFilter} 
              onRoleChange={setRoleFilter} 
              statusFilter={statusFilter} 
              onStatusChange={setStatusFilter} 
            />
            
            <MembersTable 
              members={filteredMembers} 
              onEdit={openEditModal} 
              onPassword={openPasswordModal} 
              onDeactivate={openDeactivateModal} 
              onDelete={openDeleteModal} 
              getInitials={getInitials} 
            />
            
            <div className="lg:hidden space-y-3 mt-6">
              {filteredMembers.map((m) => (
                <MemberCard 
                  key={m.id} 
                  member={m} 
                  onEdit={openEditModal} 
                  onPassword={openPasswordModal} 
                  onDelete={openDeleteModal} 
                  getInitials={getInitials} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {role !== "مدیر" && (
        <AddMemberModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddMember} formData={newMember} setFormData={setNewMember} />
      )}
      <EditMemberModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSubmit={handleEditMember} formData={editMember} setFormData={setEditMember} memberName={selectedMember?.name} />
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} onSubmit={handleChangePassword} formData={passwordData} setFormData={setPasswordData} memberName={selectedMember?.name} />
      <DeactivateMemberModal isOpen={isDeactivateModalOpen} onClose={() => setIsDeactivateModalOpen(false)} onConfirm={handleDeactivate} memberName={selectedMember?.name} />
      <DeleteMemberModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} memberName={selectedMember?.name} />
    </DashboardLayout>
    </RoleGuard>
  );
}