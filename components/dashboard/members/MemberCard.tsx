// components/dashboard/members/MemberCard.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Member } from "./types";

interface MemberCardProps {
  member: Member;
  index: number;
  onEdit: (member: Member) => void;
  onDelete?: (member: Member) => void;
}

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`;
};

export default function MemberCard({ member, index, onEdit, onDelete }: MemberCardProps) {
  const fullName = `${member.firstName} ${member.lastName}`;
  const initials = getInitials(member.firstName, member.lastName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(89,216,195,0.3)] transition-all"
    >
      <div className="flex items-start gap-4">
        <span className="relative inline-flex flex-shrink-0">
          <span className="rounded-full inline-flex items-center justify-center font-semibold bg-[rgba(89,216,195,0.14)] text-[#59D8C3] border border-[rgba(89,216,195,0.2)] w-11 h-11 text-sm">
            {initials}
          </span>
          {member.presence === "online" && (
            <span className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full border-2 border-[rgba(9,22,18,0.8)] bg-[#5be0a8]" />
          )}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <Link href={`/dashboard/members/${member.id}`}>
                <h3 className="text-base font-bold text-white mb-1 cursor-pointer hover:text-[#59D8C3] transition-colors">
                  {fullName}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 mb-2">@{member.username}</p>

              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs bg-[rgba(89,216,195,0.12)] text-[#59D8C3] border-[rgba(89,216,195,0.3)]">
                  {member.role}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs ${
                  member.status === "active"
                    ? "bg-[rgba(91,224,168,0.12)] text-[#5be0a8] border-[rgba(91,224,168,0.28)]"
                    : "bg-[rgba(111,136,128,0.12)] text-gray-400 border-[rgba(111,136,128,0.22)]"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${member.status === "active" ? "bg-[#5be0a8]" : "bg-gray-500"}`} />
                  {member.status === "active" ? "فعال" : "غیرفعال"}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs ${
                  member.presence === "online"
                    ? "bg-[rgba(91,224,168,0.12)] text-[#5be0a8] border-[rgba(91,224,168,0.28)]"
                    : "bg-[rgba(111,136,128,0.12)] text-gray-400 border-[rgba(111,136,128,0.22)]"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${member.presence === "online" ? "bg-[#5be0a8]" : "bg-gray-500"}`} />
                  {member.presence === "online" ? "آنلاین" : "آفلاین"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
            <div>
              <p className="text-xs text-gray-500 mb-1">شماره همراه</p>
              <p className="text-sm text-white font-medium" dir="ltr">{member.phone || "ثبت نشده"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">دپارتمان</p>
              <p className="text-sm text-white font-medium">{member.departmentName || "ثبت نشده"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">آخرین فعالیت</p>
              <p className="text-sm text-white font-medium">{member.lastActivity}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">گفتگوهای باز</p>
              <p className="text-sm text-white font-medium">{member.openTickets}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/dashboard/conversations?member=${member.id}`}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
            >
              مشاهده گفتگوها
            </Link>
            <button
              onClick={() => onEdit(member)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[rgba(89,216,195,0.08)] text-[#59D8C3] border border-[rgba(89,216,195,0.15)] hover:bg-[rgba(89,216,195,0.12)] transition-all"
            >
              ویرایش
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(member)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[rgba(255,107,107,0.08)] text-red-400 border border-[rgba(255,107,107,0.15)] hover:bg-[rgba(255,107,107,0.12)] transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                حذف
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}