// components/dashboard/departments/EditDepartmentModal.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, User, Power, ChevronDown } from "lucide-react";

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

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
  onUpdate: (updated: Department) => void;
}

const managers = [
  { id: 1, name: "سارا محمدی", role: "مدیر ارشد" },
  { id: 2, name: "علی احمدی", role: "مدیر" },
  { id: 3, name: "نیلوفر کریمی", role: "مدیر" },
  { id: 4, name: "رضا نادری", role: "مدیر فنی" },
];

export default function EditDepartmentModal({
  isOpen,
  onClose,
  department,
  onUpdate,
}: EditDepartmentModalProps) {
  const [departmentName, setDepartmentName] = useState("");
  const [selectedManager, setSelectedManager] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [isManagerDropdownOpen, setIsManagerDropdownOpen] = useState(false);

  useEffect(() => {
    if (department) {
      setDepartmentName(department.name);
      setSelectedManager(department.manager);
      setStatus(department.status);
    }
  }, [department]);

  const handleSubmit = () => {
    if (!departmentName || !selectedManager || !department) return;
    onUpdate({
      ...department,
      name: departmentName,
      manager: selectedManager,
      status,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && department && (
        <>
          {/* بک‌دراپ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50"
          />

          {/* مودال */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-[#0D1B17] border border-[#59D8C3]/20 rounded-2xl overflow-hidden shadow-2xl">
              {/* هدر مودال */}
              <div className="flex items-center justify-between p-5 border-b border-[#59D8C3]/20 bg-gradient-to-r from-[#1a3833]/30 to-transparent">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#59D8C3]" />
                  <h2 className="text-xl font-bold text-white">ویرایش دپارتمان</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* فرم مودال */}
              <div className="p-5 space-y-5">
                {/* نام دپارتمان */}
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-300 font-medium mb-2">
                    <Building2 className="w-4 h-4 text-[#59D8C3]" />
                    نام دپارتمان
                  </label>
                  <input
                    type="text"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    placeholder="نام دپارتمان را وارد کنید"
                    className="w-full bg-[#12251F] border border-[#59D8C3]/20 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                  />
                </div>

                {/* مدیر دپارتمان */}
                <div className="relative">
                  <label className="flex items-center gap-2 text-sm text-gray-300 font-medium mb-2">
                    <User className="w-4 h-4 text-[#59D8C3]" />
                    مدیر دپارتمان
                  </label>
                  <button
                    onClick={() => setIsManagerDropdownOpen(!isManagerDropdownOpen)}
                    className="w-full bg-[#12251F] border border-[#59D8C3]/20 rounded-lg p-3 text-right text-white flex items-center justify-between"
                  >
                    <span>{selectedManager || "انتخاب مدیر..."}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${isManagerDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isManagerDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#0D1B17] border border-[#59D8C3]/20 rounded-lg overflow-hidden shadow-xl z-50">
                      {managers.map((manager) => (
                        <button
                          key={manager.id}
                          onClick={() => {
                            setSelectedManager(manager.name);
                            setIsManagerDropdownOpen(false);
                          }}
                          className="w-full text-right px-4 py-1 hover:bg-[#12251F] transition-colors"
                        >
                          <p className="text-white text-sm">{manager.name}</p>
                          <p className="text-gray-500 text-xs">{manager.role}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* وضعیت */}
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-300 font-medium mb-2">
                    <Power className="w-4 h-4 text-[#59D8C3]" />
                    وضعیت
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStatus("active")}
                      className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 ${
                        status === "active"
                          ? "bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] font-medium"
                          : "bg-[#12251F] text-gray-400 hover:text-white"
                      }`}
                    >
                      فعال
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("inactive")}
                      className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 ${
                        status === "inactive"
                          ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium"
                          : "bg-[#12251F] text-gray-400 hover:text-white"
                      }`}
                    >
                      غیرفعال
                    </button>
                  </div>
                </div>
              </div>

              {/* دکمه‌های مودال */}
              <div className="flex gap-3 p-5 border-t border-[#59D8C3]/20">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-[#12251F] hover:bg-[#1A352B] text-gray-300 rounded-lg transition-colors"
                >
                  انصراف
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!departmentName || !selectedManager}
                  className={`flex-1 px-4 py-2 bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] font-medium rounded-lg transition-all duration-300 ${
                    !departmentName || !selectedManager
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-lg hover:shadow-[#59D8C3]/25"
                  }`}
                >
                  ذخیره
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}