// components/dashboard/departments/DepartmentsList.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  Users,
  MessageCircle,
  Eye,
  Edit,
  Power,
  Trash2,
} from "lucide-react";
import EditDepartmentModal from "./EditDepartmentModal";
import AddDepartmentModal from "./AddDepartmentModal";
import DeactivateModal from "./DeactivateModal";

interface Department {
  id: number;
  name: string;
  manager: string;
  status: "active" | "inactive";
  memberCount: number;
  openTickets: number;
  unansweredTickets: number;
  color: string;
}

interface DepartmentsListProps {
  selectedRole?: string;
}

const getInitials = (name: string) => {
  if (!name) return "?";
  const names = name.split(" ");
  if (names.length >= 1) {
    return `${names[0].charAt(0)}`;
  }
  return name.charAt(0);
};

const departmentColors = ["#59D8C3", "#5BE0A8", "#4CAF50", "#FF9800", "#2196F3", "#9C27B0"];

const departmentsData: Department[] = [
  {
    id: 1,
    name: "حسابداری",
    manager: "سارا محمدی",
    status: "active",
    memberCount: 6,
    openTickets: 19,
    unansweredTickets: 8,
    color: "#59D8C3",
  },
  {
    id: 2,
    name: "سفرهای داخلی",
    manager: "علی احمدی",
    status: "active",
    memberCount: 3,
    openTickets: 12,
    unansweredTickets: 5,
    color: "#5BE0A8",
  },
  {
    id: 3,
    name: "سفرهای خارجی",
    manager: "نیلوفر کریمی",
    status: "active",
    memberCount: 2,
    openTickets: 14,
    unansweredTickets: 7,
    color: "#4CAF50",
  },
  {
    id: 4,
    name: "پشتیبانی فنی",
    manager: "رضا نادری",
    status: "inactive",
    memberCount: 1,
    openTickets: 7,
    unansweredTickets: 3,
    color: "#FF9800",
  },
];

export default function DepartmentsList({ selectedRole }: DepartmentsListProps) {
  const [departments, setDepartments] = useState<Department[]>(departmentsData);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [deactivatingDepartment, setDeactivatingDepartment] = useState<Department | null>(null);

  const handleToggleStatus = (department: Department) => {
    if (department.status === "active") {
      setDeactivatingDepartment(department);
      setIsDeactivateModalOpen(true);
    } else {
      setDepartments((prev) =>
        prev.map((dept) =>
          dept.id === department.id ? { ...dept, status: "active" } : dept
        )
      );
    }
  };

  const confirmDeactivate = () => {
    if (deactivatingDepartment) {
      setDepartments((prev) =>
        prev.map((dept) =>
          dept.id === deactivatingDepartment.id ? { ...dept, status: "inactive" } : dept
        )
      );
    }
    setIsDeactivateModalOpen(false);
    setDeactivatingDepartment(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("آیا از حذف این دپارتمان مطمئن هستید؟")) {
      setDepartments((prev) => prev.filter((dept) => dept.id !== id));
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setIsEditModalOpen(true);
  };

  const handleUpdateDepartment = (updatedDepartment: Department) => {
    setDepartments((prev) =>
      prev.map((dept) => (dept.id === updatedDepartment.id ? updatedDepartment : dept))
    );
  };

  const handleAddDepartment = (newDepartment: Omit<Department, "id">) => {
    const newId = departments.length + 1;
    setDepartments((prev) => [...prev, { ...newDepartment, id: newId }]);
  };

  const activeDepartments = departments.filter((d) => d.status === "active");
  const inactiveDepartments = departments.filter((d) => d.status === "inactive");

  return (
    <>
      <div className="space-y-6">
        {/* دکمه افزودن دپارتمان */}
        <div className="flex justify-end">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] font-medium rounded-lg hover:shadow-lg transition-all duration-300"
          >
            + افزودن دپارتمان
          </button>
        </div>

        {/* دپارتمان‌های فعال */}
        {activeDepartments.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">دپارتمان‌های فعال</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeDepartments.map((dept, index) => (
                <DepartmentCard
                  key={dept.id}
                  department={dept}
                  onToggleStatus={handleToggleStatus}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}

        {/* دپارتمان‌های غیرفعال */}
        {inactiveDepartments.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">دپارتمان‌های غیرفعال</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {inactiveDepartments.map((dept, index) => (
                <DepartmentCard
                  key={dept.id}
                  department={dept}
                  onToggleStatus={handleToggleStatus}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* مودال‌ها */}
      <EditDepartmentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        department={editingDepartment}
        onUpdate={handleUpdateDepartment}
      />

      <AddDepartmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDepartment={handleAddDepartment}
        nextId={departments.length + 1}
      />

      <DeactivateModal
        isOpen={isDeactivateModalOpen}
        onClose={() => {
          setIsDeactivateModalOpen(false);
          setDeactivatingDepartment(null);
        }}
        onConfirm={confirmDeactivate}
        departmentName={deactivatingDepartment?.name || ""}
      />
    </>
  );
}

// کامپوننت کارت دپارتمان
function DepartmentCard({
  department,
  onToggleStatus,
  onEdit,
  onDelete,
  index,
}: {
  department: Department;
  onToggleStatus: (dept: Department) => void;
  onEdit: (dept: Department) => void;
  onDelete: (id: number) => void;
  index: number;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-[#0D1B17] border rounded-xl overflow-hidden transition-all duration-300 ${
        department.status === "active"
          ? "border-[#59D8C3]/30 hover:border-[#59D8C3]/60"
          : "border-gray-500/30 hover:border-gray-500/60 opacity-80"
      }`}
    >
      {/* هدر کارت */}
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${department.color}20` }}
            >
              <span className="text-[#59D8C3] font-bold text-sm">
                {getInitials(department.name)}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{department.name}</h3>
              <p className="text-gray-400 text-sm">مدیر: {department.manager}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleStatus(department)}
              className={`px-3 py-2 rounded-3xl transition-colors flex items-center gap-2 text-xs font-medium ${
                department.status === "active"
                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
              }`}
            >
              <span>{department.status === "active" ? "فعال" : "غیرفعال"}</span>
            </button>

            <button
              onClick={() => onEdit(department)}
              className="p-2 bg-[#59D8C3]/10 hover:bg-[#59D8C3]/20 flex items-center gap-1 rounded-2xl transition-colors"
            >
              <Edit className="w-4 h-4 text-[#59D8C3]" />
              <span className="text-xs text-[#59D8C3]">ویرایش</span>
            </button>

            <button
              onClick={() => onDelete(department.id)}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 flex items-center gap-1 rounded-2xl transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400">حذف</span>
            </button>
          </div>
        </div>
      </div>

      {/* آمار دپارتمان */}
      <div className="grid grid-cols-3 p-2 gap-2 mb-2">
        <div className="p-4 bg-[#0c383133] border border-[#0c383133]/70 rounded-3xl text-center">
          <p className="text-2xl font-bold text-white">{department.memberCount}</p>
          <p className="text-xs text-gray-400">عضو</p>
        </div>
        <div className="p-4 text-center bg-[#0c2c3833] border border-[#0c383133]/70 rounded-3xl">
          <p className="text-2xl font-bold text-[#246b85ec]">{department.openTickets}</p>
          <p className="text-xs text-gray-400">تیکت باز</p>
        </div>
        <div className="p-4 text-center bg-[#0c381233] border border-[#0c383133]/70 rounded-3xl">
          <p className="text-2xl font-bold text-[#d0ff00]">{department.unansweredTickets}</p>
          <p className="text-xs text-gray-400">بی‌پاسخ</p>
        </div>
      </div>

      {/* دکمه مشاهده جزئیات */}
      <div className="p-4 pt-0">
        <Link
          href={`/dashboard/departments/${department.id}`}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#59bfd8] hover:bg-[#59D8C3]/30 text-black hover:text-[#59D8C3] transition-colors text-sm"
        >
          <Eye className="w-4 h-4" />
          <span>مشاهده جزئیات</span>
        </Link>
      </div>
    </motion.div>
  );
}