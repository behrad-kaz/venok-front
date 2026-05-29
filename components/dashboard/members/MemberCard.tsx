// components/dashboard/members/MemberCard.tsx
"use client";

import { Member } from "./types";

interface MemberCardProps {
  member: Member;
  onEdit: (member: Member) => void;
  onPassword: (member: Member) => void;
  onDelete: (member: Member) => void;
  getInitials: (name: string) => string;
}

export default function MemberCard({ member, onEdit, onPassword, onDelete, getInitials }: MemberCardProps) {
  return (
    <div className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-[#59D8C3]/10 border border-[#59D8C3]/20 flex items-center justify-center">
            <span className="text-[#59D8C3] text-xs font-bold">{getInitials(member.name)}</span>
          </div>
          <span className={`absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full border-2 border-[#0D1B17] ${member.status === "online" ? "bg-[#5BE0A8]" : "bg-gray-500"}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{member.name}</p>
          <p className="text-xs text-gray-500">@{member.username}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs ${
          member.role === "مدیر کل"
            ? "bg-[#59D8C3]/10 text-[#59D8C3] border-[#59D8C3]/30"
            : member.role === "مدیر دپارتمان"
            ? "bg-[#5BE0A8]/10 text-[#5BE0A8] border-[#5BE0A8]/30"
            : "bg-gray-500/10 text-gray-400 border-gray-500/30"
        }`}>
          {member.role}
        </span>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
        <span>{member.department}</span><span>·</span>
        <span>{member.tickets} تیکت</span><span>·</span>
        <span>{member.lastActivity}</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onEdit(member)} className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-[#12251F] border border-[#59D8C3]/20 text-gray-300 hover:border-[#59D8C3]/40 transition-colors">ویرایش</button>
        <button onClick={() => onPassword(member)} className="px-3 py-1.5 rounded-xl text-xs bg-[#12251F] border border-[#59D8C3]/20 text-gray-300 hover:border-[#59D8C3]/40 transition-colors">رمز</button>
        <button onClick={() => onDelete(member)} className="px-3 py-1.5 rounded-xl text-xs bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors">حذف</button>
      </div>
    </div>
  );
}