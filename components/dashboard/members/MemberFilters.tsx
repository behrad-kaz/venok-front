// components/dashboard/members/MemberFilters.tsx
"use client";

import { Search } from "lucide-react";
import { Department } from "./types";

interface MemberFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedPresence: string;
  onPresenceChange: (presence: string) => void;
  departments: Department[];
}

export default function MemberFilters({
  searchQuery,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  selectedPresence,
  onPresenceChange,
  departments,
}: MemberFiltersProps) {
  return (
    <div className="flex items-start gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">دپارتمان:</span>
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0D1B17] border border-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:border-[#59D8C3] transition-all cursor-pointer"
          style={{ backgroundColor: "#0D1B17" }}
        >
          <option value="all" className="bg-[#0D1B17] text-white">همه</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id} className="bg-[#0D1B17] text-white">
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">نقش:</span>
        <div className="flex gap-2">
          {["all", "مدیر دپارتمان", "کارمند"].map((role) => (
            <button
              key={role}
              onClick={() => onRoleChange(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                selectedRole === role
                  ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                  : "bg-[rgba(255,255,255,0.03)] border-transparent text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
              }`}
            >
              {role === "all" ? "همه" : role === "مدیر دپارتمان" ? "مدیر دپارتمان" : "کارمند"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">وضعیت:</span>
        <div className="flex gap-2">
          {["all", "active", "inactive"].map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                selectedStatus === status
                  ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                  : "bg-[rgba(255,255,255,0.03)] border-transparent text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
              }`}
            >
              {status === "all" ? "همه" : status === "active" ? "فعال" : "غیرفعال"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">وضعیت حضور:</span>
        <div className="flex gap-2">
          {["all", "online", "offline"].map((presence) => (
            <button
              key={presence}
              onClick={() => onPresenceChange(presence)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                selectedPresence === presence
                  ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)] text-[#59D8C3]"
                  : "bg-[rgba(255,255,255,0.03)] border-transparent text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
              }`}
            >
              {presence === "all" ? "همه" : presence === "online" ? "آنلاین" : "آفلاین"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}