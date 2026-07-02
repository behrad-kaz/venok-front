// components/dashboard/departments/DepartmentCard.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Users, MessageCircle, Edit, MoreHorizontal, Eye, EyeOff, Trash2 } from "lucide-react";
import { Department } from "./types";

interface DepartmentCardProps {
  department: Department;
  index: number;
  onEdit: (dept: Department) => void;
  onDelete: (id: number, name: string) => void;
  onToggleStatus: (id: number, currentStatus: "active" | "inactive") => void;
}

const getStatusBadge = (status: Department["status"], statusType: Department["statusType"]) => {
  if (status === "inactive") {
    return {
      text: "غیرفعال",
      color: "bg-[rgba(111,136,128,0.12)] text-gray-400 border-[rgba(111,136,128,0.22)]",
      dotColor: "bg-gray-500",
    };
  }
  if (statusType === "busy") {
    return {
      text: "شلوغ",
      color: "bg-[rgba(242,184,75,0.12)] text-[#f2b84b] border-[rgba(242,184,75,0.28)]",
      dotColor: "bg-[#f2b84b]",
    };
  }
  if (statusType === "attention") {
    return {
      text: "نیازمند توجه",
      color: "bg-[rgba(255,107,107,0.12)] text-red-400 border-[rgba(255,107,107,0.22)]",
      dotColor: "bg-red-400",
    };
  }
  return {
    text: "عادی",
    color: "bg-[rgba(91,224,168,0.12)] text-[#5be0a8] border-[rgba(91,224,168,0.28)]",
    dotColor: "bg-[#5be0a8]",
  };
};

export default function DepartmentCard({ 
  department, 
  index, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: DepartmentCardProps) {
  const badge = getStatusBadge(department.status, department.statusType);

  // لینک به صفحه اعضا با پارامتر دپارتمان
  const membersLink = `/dashboard/members?department=${department.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(89,216,195,0.3)] transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border"
            style={{ backgroundColor: `${department.color}15`, borderColor: `${department.color}30`, color: department.color }}
          >
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/dashboard/departments/${department.id}`}>
                <h3 className="text-base font-bold text-white truncate cursor-pointer hover:text-[#59D8C3] transition-colors">
                  {department.name}
                </h3>
              </Link>
              <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium px-2.5 py-1 text-xs ${badge.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${badge.dotColor}`} />
                {badge.text}
              </span>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{department.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">مدیر دپارتمان:</span>
              <span className="text-xs text-white font-medium">{department.manager || "بدون مدیر"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleStatus(department.id, department.status)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
            title={department.status === "active" ? "غیرفعال کردن" : "فعال کردن"}
          >
            {department.status === "active" ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onEdit(department)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
            title="ویرایش"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(department.id, department.name)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-[rgba(255,107,107,0.05)] transition-all"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
        <div>
          <p className="text-xs text-gray-500 mb-1">اعضا</p>
          <p className="text-lg font-bold text-white">{department.memberCount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">گفتگوهای باز</p>
          <p className="text-lg font-bold text-white">{department.openTickets}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-500 mb-1">میانگین پاسخ</p>
          <p className="text-lg font-bold text-white">{department.avgResponseTime}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href={membersLink}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
          >
            مشاهده اعضا
          </Link>
          <Link
            href={`/dashboard/requests?department=${department.id}`}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
          >
            مشاهده گفتگوها
          </Link>
        </div>
        <button
          onClick={() => onEdit(department)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[rgba(89,216,195,0.08)] text-[#59D8C3] border border-[rgba(89,216,195,0.15)] hover:bg-[rgba(89,216,195,0.12)] transition-all"
        >
          ویرایش
        </button>
      </div>
    </motion.div>
  );
}