// components/onboarding/steps/Step2Departments.tsx
"use client";

import { useState } from "react";
import { Plus, CheckCircle, Trash2, Edit2, Eye, EyeOff, Building2 } from "lucide-react";
import { Department } from "../types";

interface Step2DepartmentsProps {
  departments: Department[];
  onAddDepartment: (dept: Omit<Department, "id">) => void;
  onAddQuickDepartment: (name: string) => void;
  onRemoveDepartment: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onEditDepartment: (dept: Department) => void;
  onSaveEdit: (editedDept: Department) => void;
  onCancelEdit: () => void;
  editingDepartment: Department | null;
}

const quickDepartments = [
  "پشتیبانی",
  "فروش",
  "مالی",
  "پیگیری سفارش",
  "سایر موارد",
];

export default function Step2Departments({
  departments,
  onAddDepartment,
  onAddQuickDepartment,
  onRemoveDepartment,
  onToggleStatus,
  onEditDepartment,
  onSaveEdit,
  onCancelEdit,
  editingDepartment,
}: Step2DepartmentsProps) {
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const [localEditingDept, setLocalEditingDept] = useState<Department | null>(null);

  const handleAddDepartment = () => {
    if (!newDepartment.name.trim()) {
      alert("لطفاً نام دپارتمان را وارد کنید");
      return;
    }
    onAddDepartment(newDepartment);
    setNewDepartment({ name: "", description: "", isActive: true });
  };

  const handleSaveEdit = () => {
    if (localEditingDept) {
      onSaveEdit(localEditingDept);
      setLocalEditingDept(null);
    }
  };

  const handleEditClick = (dept: Department) => {
    setLocalEditingDept({ ...dept });
    onEditDepartment(dept);
  };

  const isEditing = localEditingDept !== null;

  return (
    <div className="space-y-6">
      {/* افزودن سریع */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2">افزودن سریع</label>
        <div className="flex flex-wrap gap-2">
          {quickDepartments.map((deptName) => {
            const isAdded = departments.some(d => d.name === deptName);
            return (
              <button
                key={deptName}
                onClick={() => onAddQuickDepartment(deptName)}
                disabled={isAdded}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1 ${
                  isAdded
                    ? "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.1)] text-gray-500 cursor-not-allowed opacity-50"
                    : "bg-[rgba(89,216,195,0.08)] border-[rgba(89,216,195,0.2)] text-[#59D8C3] hover:bg-[rgba(89,216,195,0.12)]"
                }`}
              >
                {!isAdded && <Plus className="w-3 h-3" />}
                {isAdded && <CheckCircle className="w-3 h-3" />}
                {deptName}
              </button>
            );
          })}
        </div>
      </div>

      {/* فرم افزودن یا ویرایش دپارتمان */}
      {!isEditing ? (
        <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
          <h4 className="text-sm font-semibold text-white mb-4">افزودن دپارتمان جدید</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                نام دپارتمان <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={newDepartment.name}
                onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                placeholder="مثال: پشتیبانی فنی"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">توضیح کوتاه</label>
              <input
                type="text"
                value={newDepartment.description}
                onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                placeholder="توضیحات اختیاری"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newDepartment.isActive}
                onChange={(e) => setNewDepartment({ ...newDepartment, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] checked:bg-[#59D8C3] checked:border-[#59D8C3]"
              />
              <span className="text-xs text-gray-400">فعال</span>
            </label>
            <button
              onClick={handleAddDepartment}
              className="px-4 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg transition-all"
            >
              افزودن
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
          <h4 className="text-sm font-semibold text-white mb-4">ویرایش دپارتمان</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                نام دپارتمان <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={localEditingDept?.name || ""}
                onChange={(e) => setLocalEditingDept(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">توضیح کوتاه</label>
              <input
                type="text"
                value={localEditingDept?.description || ""}
                onChange={(e) => setLocalEditingDept(prev => prev ? { ...prev, description: e.target.value } : null)}
                className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localEditingDept?.isActive || false}
                onChange={(e) => setLocalEditingDept(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                className="w-4 h-4 rounded border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] checked:bg-[#59D8C3]"
              />
              <span className="text-xs text-gray-400">فعال</span>
            </label>
            <div className="flex gap-2">
              <button onClick={onCancelEdit} className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white">انصراف</button>
              <button onClick={handleSaveEdit} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[rgba(255,255,255,0.05)] border text-white hover:border-[#59D8C3]/40">ذخیره تغییرات</button>
            </div>
          </div>
        </div>
      )}

      {/* لیست دپارتمان‌ها */}
      <div className="space-y-3">
        {departments.map((dept) => (
          <div key={dept.id} className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(89,216,195,0.3)] transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="text-sm font-semibold text-white">{dept.name}</h5>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${dept.isActive ? "bg-[rgba(91,224,168,0.1)] text-green-400" : "bg-[rgba(255,107,107,0.1)] text-red-400"}`}>
                    {dept.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </div>
                {dept.description && <p className="text-xs text-gray-500">{dept.description}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => onToggleStatus(dept.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white" title={dept.isActive ? "غیرفعال کردن" : "فعال کردن"}>
                  {dept.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => handleEditClick(dept)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white" title="ویرایش">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => onRemoveDepartment(dept.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400" title="حذف">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-dashed text-center">
          <Building2 className="w-8 h-8 mx-auto mb-3 text-gray-500" />
          <p className="text-sm text-gray-400 mb-1">هنوز دپارتمانی اضافه نشده</p>
          <p className="text-xs text-gray-500">از افزودن سریع استفاده کنید یا دپارتمان دلخواه خود را ایجاد کنید.</p>
        </div>
      )}
    </div>
  );
}