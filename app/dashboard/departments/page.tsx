// app/dashboard/departments/page.tsx (بازنویسی شده)
"use client";

import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { departmentsData, statsData } from "@/components/dashboard/departments/data";
import { Department } from "@/components/dashboard/departments/types";
import StatsCards from "@/components/dashboard/departments/StatsCards";
import DepartmentCard from "@/components/dashboard/departments/DepartmentCard";
import DepartmentSidebar from "@/components/dashboard/departments/DepartmentSidebar";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(departmentsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const filteredDepartments = departments.filter((dept) => {
    if (statusFilter !== "all" && dept.status !== statusFilter) return false;
    if (searchQuery && !dept.name.includes(searchQuery) && !dept.description.includes(searchQuery)) return false;
    return true;
  });

  const handleAddDepartment = (data: { name: string; description: string; status: "active" | "inactive"; color: string }) => {
    const newDepartment: Department = {
      id: departments.length + 1,
      name: data.name,
      manager: "",
      description: data.description,
      status: data.status,
      memberCount: 0,
      openTickets: 0,
      avgResponseTime: "-",
      color: data.color,
      statusType: "normal",
    };
    setDepartments([...departments, newDepartment]);
  };

  const handleEditDepartment = (data: { name: string; description: string; status: "active" | "inactive"; color: string }) => {
    if (editingDepartment) {
      setDepartments(
        departments.map((dept) =>
          dept.id === editingDepartment.id
            ? { ...dept, name: data.name, description: data.description, status: data.status, color: data.color }
            : dept
        )
      );
      setEditingDepartment(null);
    }
  };

  const openEditSidebar = (department: Department) => {
    setEditingDepartment(department);
    setIsSidebarOpen(true);
  };

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
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
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
          <div className="space-y-4">
            {filteredDepartments.map((dept, index) => (
              <DepartmentCard key={dept.id} department={dept} index={index} onEdit={openEditSidebar} />
            ))}
          </div>
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
        />
      </DashboardLayout>
    </RoleGuard>
  );
}