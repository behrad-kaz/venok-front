// components/dashboard/members/MembersFilters.tsx
"use client";

import { Search } from "lucide-react";

interface MembersFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

const roleOptions = [
  { id: "all", label: "همه نقش‌ها" },
  { id: "مدیر کل", label: "مدیر کل" },
  { id: "مدیر دپارتمان", label: "مدیر دپارتمان" },
  { id: "کارمند پشتیبانی", label: "کارمند پشتیبانی" },
];

const statusOptions = [
  { id: "all", label: "همه وضعیت‌ها" },
  { id: "online", label: "آنلاین" },
  { id: "offline", label: "آفلاین" },
];

export default function MembersFilters({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
}: MembersFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 mt-6">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="جستجو نام یا نام کاربری..."
          className="w-full rounded-xl pr-9 pl-4 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-all"
        />
      </div>

      <select
        value={roleFilter}
        onChange={(e) => onRoleChange(e.target.value)}
        className="rounded-xl px-3 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white focus:outline-none focus:border-[#59D8C3] cursor-pointer"
      >
        {roleOptions.map((opt) => (
          <option key={opt.id} value={opt.id}>{opt.label}</option>
        ))}
      </select>

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-xl px-3 py-2.5 text-sm bg-[#12251F] border border-[#59D8C3]/20 text-white focus:outline-none focus:border-[#59D8C3] cursor-pointer"
      >
        {statusOptions.map((opt) => (
          <option key={opt.id} value={opt.id}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}