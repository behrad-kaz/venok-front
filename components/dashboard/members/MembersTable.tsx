// components/dashboard/members/MembersTable.tsx
"use client";

import { Member } from "./types";

interface MembersTableProps {
  members: Member[];
  onEdit: (member: Member) => void;
  onPassword: (member: Member) => void;
  onDeactivate: (member: Member) => void;
  onDelete: (member: Member) => void;
  getInitials: (name: string) => string;
}

export default function MembersTable({
  members,
  onEdit,
  onPassword,
  onDeactivate,
  onDelete,
  getInitials,
}: MembersTableProps) {
  return (
    <div className="hidden lg:block mt-6">
      <div className="rounded-2xl bg-[#0D1B17] border border-[#59D8C3]/20 overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-[#59D8C3]/20">
            <tr>
              <th className="text-right text-xs font-medium text-gray-500 px-5 py-3.5">عضو</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3.5">نقش</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3.5">دپارتمان</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3.5">وضعیت</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3.5">تیکت‌ها</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3.5">آخرین فعالیت</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3.5">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-[#59D8C3]/10 last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-7 h-7 rounded-xl bg-[#59D8C3]/10 border border-[#59D8C3]/20 flex items-center justify-center">
                        <span className="text-[#59D8C3] text-[10px] font-bold">{getInitials(member.name)}</span>
                      </div>
                      <span className={`absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full border-2 border-[#0D1B17] ${member.status === "online" ? "bg-[#5BE0A8]" : "bg-gray-500"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{member.name}</p>
                      <p className="text-xs text-gray-500">@{member.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs ${
                    member.role === "مدیر کل"
                      ? "bg-[#59D8C3]/10 text-[#59D8C3] border-[#59D8C3]/30"
                      : member.role === "مدیر دپارتمان"
                      ? "bg-[#5BE0A8]/10 text-[#5BE0A8] border-[#5BE0A8]/30"
                      : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-4 py-4"><span className="text-sm text-white">{member.department}</span></td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${member.status === "online" ? "bg-[#5BE0A8] shadow-[0_0_6px_rgba(91,224,168,0.6)]" : "bg-gray-500"}`} />
                    <span className="text-xs text-gray-500">{member.status === "online" ? "آنلاین" : "آفلاین"}</span>
                  </div>
                </td>
                <td className="px-4 py-4"><span className="text-sm text-white">{member.tickets}</span></td>
                <td className="px-4 py-4"><span className="text-xs text-gray-500">{member.lastActivity}</span></td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => onEdit(member)} className="px-2 py-1 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-[#12251F] transition-colors">ویرایش</button>
                    <button onClick={() => onPassword(member)} className="px-2 py-1 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-[#12251F] transition-colors">رمز</button>
                    <button onClick={() => onDeactivate(member)} className="px-2 py-1 rounded-lg text-xs text-gray-400 hover:text-[#F2B84B] hover:bg-[rgba(242,184,75,0.08)] transition-colors">غیرفعال</button>
                    <button onClick={() => onDelete(member)} className="px-2 py-1 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:bg-[rgba(255,107,107,0.08)] transition-colors">حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}