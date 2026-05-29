// app/dashboard/departments/page.tsx
"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DepartmentsList from "@/components/dashboard/departments/DepartmentsList";
import AddDepartmentModal from "@/components/dashboard/departments/AddDepartmentModal";
import Link from "next/link";

export default function DepartmentsPage() {
  const [selectedRole, setSelectedRole] = useState<string>("مدیر کل");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [nextId, setNextId] = useState(5);

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    if (savedRole) {
      setSelectedRole(savedRole);
    }
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* عنوان صفحه */}
        <div className="flex justify-between ">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-white">دپارتمان‌ها</h1>
            <p className="text-gray-400 text-sm mt-1">مدیریت دپارتمان‌های سازمان</p>
          </div>
                    <Link
            href="/"
            className="z-10 max-h-9 flex items-center gap-1.5 px-3  rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[#59D8C3]/20 text-[11px] text-gray-400 hover:text-white hover:border-[#59D8C3]/40 transition-all duration-300"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            <span>صفحه اصلی</span>
          </Link>
        </div>

        {/* لیست دپارتمان‌ها */}
        <DepartmentsList selectedRole={selectedRole} />

        {/* مودال افزودن دپارتمان */}
        <AddDepartmentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddDepartment={(newDepartment) => {}}
          nextId={nextId}
        />
      </div>
    </DashboardLayout>
  );
}