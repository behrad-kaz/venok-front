// components/dashboard/departments/DepartmentSidebar.tsx
"use client";

import { X, Building2, FileText, Power, Palette } from "lucide-react";
import { useEffect, useState } from "react";

interface DepartmentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  editingDepartment?: {
    id: number;
    name: string;
    description: string;
    status: "active" | "inactive";
    color: string;
  } | null;
  onSave: (data: { name: string; description: string; status: "active" | "inactive"; color: string }) => void;
  title: string;
  isSubmitting?: boolean;
}

const colorOptions = ["#59D8C3", "#F2B84B", "#8B7FDF", "#FF6B6B", "#9CA3AF"];

export default function DepartmentSidebar({ 
  isOpen, 
  onClose, 
  editingDepartment, 
  onSave, 
  title,
  isSubmitting = false 
}: DepartmentSidebarProps) {
  const [name, setName] = useState(editingDepartment?.name || "");
  const [description, setDescription] = useState(editingDepartment?.description || "");
  const [status, setStatus] = useState<"active" | "inactive">(editingDepartment?.status || "active");
  const [selectedColor, setSelectedColor] = useState(editingDepartment?.color || colorOptions[0]);

  useEffect(() => {
    if (editingDepartment) {
      setName(editingDepartment.name);
      setDescription(editingDepartment.description);
      setStatus(editingDepartment.status);
      setSelectedColor(editingDepartment.color);
    } else {
      setName("");
      setDescription("");
      setStatus("active");
      setSelectedColor(colorOptions[0]);
    }
  }, [editingDepartment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    onSave({ name, description, status, color: selectedColor });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed left-0 top-0 bottom-0 w-full max-w-md bg-[rgba(9,22,18,0.98)] border-l border-[rgba(255,255,255,0.1)] z-50 overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                نام دپارتمان <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: پشتیبانی، فروش، مالی"
                required
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                توضیح کوتاه <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="توضیح مختصری درباره وظایف این دپارتمان"
                required
                rows={3}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors resize-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">وضعیت</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStatus("active")}
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                    status === "active"
                      ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                      : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-gray-500 hover:text-white"
                  } disabled:opacity-50`}
                >
                  فعال
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("inactive")}
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                    status === "inactive"
                      ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                      : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-gray-500 hover:text-white"
                  } disabled:opacity-50`}
                >
                  غیرفعال
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">رنگ نشانگر (اختیاری)</label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    disabled={isSubmitting}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      selectedColor === color ? "ring-2 ring-white scale-110" : "hover:scale-105"
                    } disabled:opacity-50`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[rgba(255,255,255,0.1)]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#06110F] border-t-transparent rounded-full animate-spin" />
                    در حال ذخیره...
                  </>
                ) : (
                  editingDepartment ? "ذخیره تغییرات" : "ایجاد دپارتمان"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}