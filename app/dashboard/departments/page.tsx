// app/dashboard/departments/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { Department } from "@/components/dashboard/departments/types";
import StatsCards from "@/components/dashboard/departments/StatsCards";
import DepartmentCard from "@/components/dashboard/departments/DepartmentCard";
import DepartmentSidebar from "@/components/dashboard/departments/DepartmentSidebar";
import { getTeams, createTeam, updateTeam, deleteTeam, TeamResponse } from "@/services/teamApi";
import { useModal } from "@/components/ui/modal";

export default function DepartmentsPage() {
  const { showSuccess, showError, showWarning, showConfirm } = useModal();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ تبدیل TeamResponse به Department
  const mapTeamToDepartment = (team: TeamResponse): Department => {
    // پیدا کردن managerName از supportAgentTeams
    let managerName = "";
    if (team.supportAgentTeams && team.supportAgentTeams.length > 0) {
      const leadTeam = team.supportAgentTeams.find(t => t.role === "lead");
      if (leadTeam?.agent?.venokStaff?.name) {
        managerName = leadTeam.agent.venokStaff.name;
      }
    }

    // تعیین statusType
    let statusType: "normal" | "busy" | "attention" = "normal";
    if (team.openConversations && team.openConversations > 10) {
      statusType = "busy";
    }
    if (team.openConversations && team.openConversations > 5 && team.memberCount && team.memberCount < 3) {
      statusType = "attention";
    }

    return {
      id: team.id,
      name: team.name,
      manager: managerName || team.managerName || "",
      description: team.description || "",
      status: team.isActive ? "active" : "inactive",
      memberCount: team.memberCount || 0,
      openTickets: team.openConversations || 0,
      avgResponseTime: team.operationalStatus === "busy" ? "بیش از ۱۰ دقیقه" : "کمتر از ۵ دقیقه",
      color: team.color || "#59D8C3",
      statusType: statusType,
    };
  };

  // ✅ بارگذاری دپارتمان‌ها از سرور
  const loadDepartments = useCallback(async () => {
    try {
      setIsLoading(true);
      const teams = await getTeams();
      console.log('📡 دپارتمان‌های دریافت شده از سرور:', teams);
      
      const mappedDepartments = teams
        .filter(team => team.deletedAt === null)
        .map(mapTeamToDepartment);
      
      setDepartments(mappedDepartments);
    } catch (error) {
      console.error('❌ خطا در بارگذاری دپارتمان‌ها:', error);
      showError('خطا در بارگذاری دپارتمان‌ها');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  // ✅ فیلتر کردن دپارتمان‌ها
  const filteredDepartments = departments.filter((dept) => {
    if (statusFilter === "active" && dept.status !== "active") return false;
    if (statusFilter === "inactive" && dept.status !== "inactive") return false;
    if (statusFilter === "attention" && dept.statusType !== "attention") return false;
    if (statusFilter === "hasTickets" && dept.openTickets === 0) return false;
    if (searchQuery && !dept.name.includes(searchQuery) && !dept.description.includes(searchQuery)) return false;
    return true;
  });

  // ✅ محاسبه آمار
  const statsData = {
    totalDepartments: departments.length,
    activeDepartments: departments.filter(d => d.status === "active").length,
    totalOpenTickets: departments.reduce((sum, d) => sum + d.openTickets, 0),
    attentionNeeded: departments.filter(d => d.statusType === "attention").length,
  };

  // ✅ ایجاد دپارتمان جدید
  const handleAddDepartment = async (data: { name: string; description: string; status: "active" | "inactive"; color: string }) => {
    try {
      setIsSubmitting(true);
      
      const result = await createTeam({
        name: data.name,
        description: data.description,
        isActive: data.status === "active",
      });

      if (result) {
        const newDepartment = mapTeamToDepartment(result);
        setDepartments(prev => [...prev, newDepartment]);
        showSuccess(`دپارتمان "${data.name}" با موفقیت ایجاد شد`);
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error('❌ خطا در ایجاد دپارتمان:', error);
      showError('خطا در ایجاد دپارتمان');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ ویرایش دپارتمان
  const handleEditDepartment = async (data: { name: string; description: string; status: "active" | "inactive"; color: string }) => {
    if (!editingDepartment) return;

    try {
      setIsSubmitting(true);
      
      const result = await updateTeam(editingDepartment.id, {
        name: data.name,
        description: data.description,
        isActive: data.status === "active",
        color: data.color,
      });

      if (result) {
        const updatedDepartment = mapTeamToDepartment(result);
        setDepartments(prev =>
          prev.map(dept => dept.id === editingDepartment.id ? updatedDepartment : dept)
        );
        showSuccess(`دپارتمان "${data.name}" با موفقیت به‌روزرسانی شد`);
        setIsSidebarOpen(false);
        setEditingDepartment(null);
      }
    } catch (error) {
      console.error('❌ خطا در به‌روزرسانی دپارتمان:', error);
      showError('خطا در به‌روزرسانی دپارتمان');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ حذف دپارتمان
  const handleDeleteDepartment = (id: number, name: string) => {
    showConfirm(
      `آیا از حذف دپارتمان "${name}" مطمئن هستید؟`,
      "تایید حذف",
      async () => {
        try {
          setIsSubmitting(true);
          await deleteTeam(id);
          setDepartments(prev => prev.filter(dept => dept.id !== id));
          showSuccess(`دپارتمان "${name}" با موفقیت حذف شد`);
        } catch (error) {
          console.error('❌ خطا در حذف دپارتمان:', error);
          showError('خطا در حذف دپارتمان');
        } finally {
          setIsSubmitting(false);
        }
      }
    );
  };

  // ✅ تغییر وضعیت دپارتمان
  const handleToggleStatus = async (id: number, currentStatus: "active" | "inactive") => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const result = await updateTeam(id, { isActive: newStatus === "active" });
      
      if (result) {
        const updatedDepartment = mapTeamToDepartment(result);
        setDepartments(prev =>
          prev.map(dept => dept.id === id ? updatedDepartment : dept)
        );
        showSuccess(`وضعیت دپارتمان با موفقیت تغییر کرد`);
      }
    } catch (error) {
      console.error('❌ خطا در تغییر وضعیت دپارتمان:', error);
      showError('خطا در تغییر وضعیت دپارتمان');
    }
  };

  const openEditSidebar = (department: Department) => {
    setEditingDepartment(department);
    setIsSidebarOpen(true);
  };

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={["مدیر کل"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#59D8C3] animate-spin" />
            <span className="mr-3 text-gray-400">در حال بارگذاری دپارتمان‌ها...</span>
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["مدیر کل"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* جستجو و دکمه ایجاد */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-[280px] relative">
              <input
                type="text"
                placeholder="جستجو در دپارتمان‌ها"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
            <button
              onClick={() => {
                setEditingDepartment(null);
                setIsSidebarOpen(true);
              }}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>ایجاد دپارتمان جدید</span>
            </button>
          </div>

          {/* فیلترها */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">وضعیت:</span>
              <div className="flex gap-2">
                {["all", "active", "inactive"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      statusFilter === filter
                        ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                        : "bg-[rgba(255,255,255,0.03)] border-transparent text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                    }`}
                  >
                    {filter === "all" ? "همه" : filter === "active" ? "فعال" : "غیرفعال"}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setStatusFilter("attention")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                statusFilter === "attention"
                  ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                  : "bg-[rgba(255,255,255,0.03)] border-transparent text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
              }`}
            >
              نیازمند توجه
            </button>
            <button
              onClick={() => setStatusFilter("hasTickets")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                statusFilter === "hasTickets"
                  ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                  : "bg-[rgba(255,255,255,0.03)] border-transparent text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
              }`}
            >
              دارای گفتگوی باز
            </button>
          </div>

          {/* کارت‌های آمار */}
          <StatsCards stats={statsData} />

          {/* لیست دپارتمان‌ها */}
          {filteredDepartments.length > 0 ? (
            <div className="space-y-4">
              {filteredDepartments.map((dept, index) => (
                <DepartmentCard 
                  key={dept.id} 
                  department={dept} 
                  index={index} 
                  onEdit={openEditSidebar}
                  onDelete={handleDeleteDepartment}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-dashed border-[rgba(255,255,255,0.1)]">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">هیچ دپارتمانی یافت نشد</p>
              <p className="text-xs text-gray-500 mt-1">برای ایجاد دپارتمان جدید، روی دکمه "+" کلیک کنید.</p>
            </div>
          )}
        </div>

        {/* سایدبار ایجاد/ویرایش دپارتمان */}
        <DepartmentSidebar
          isOpen={isSidebarOpen}
          onClose={() => {
            setIsSidebarOpen(false);
            setEditingDepartment(null);
          }}
          editingDepartment={editingDepartment}
          onSave={editingDepartment ? handleEditDepartment : handleAddDepartment}
          title={editingDepartment ? "ویرایش دپارتمان" : "ایجاد دپارتمان جدید"}
          isSubmitting={isSubmitting}
        />
      </DashboardLayout>
    </RoleGuard>
  );
}