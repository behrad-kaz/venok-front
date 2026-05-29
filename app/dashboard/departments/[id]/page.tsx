// app/dashboard/departments/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Users, Edit, UserPlus, ChevronLeft } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AddMemberToDepartmentModal from "@/components/dashboard/departments/AddMemberToDepartmentModal";

interface Department {
  id: number;
  name: string;
  manager: string;
  managerAvatar?: string;
  managerStatus: "online" | "offline";
  managerPhone: string;
  managerEmail: string;
  status: "active" | "inactive";
  memberCount: number;
  openTickets: number;
  unansweredTickets: number;
  closedTickets: number;
  color: string;
  description: string;
}

interface DepartmentMember {
  id: number;
  name: string;
  email: string;
  role: "مدیر" | "کارشناس" | "کارمند";
  avatar?: string;
  assignedTickets: number;
  status: "online" | "offline";
}

const departmentsData: Department[] = [
  {
    id: 1,
    name: "حسابداری",
    manager: "سارا محمدی",
    managerAvatar: "https://ui-avatars.com/api/?background=59D8C3&color=06110F&name=سارا&length=2&font-size=0.24&size=80",
    managerStatus: "online",
    managerPhone: "09123456789",
    managerEmail: "sara.mohammadi@example.com",
    status: "active",
    memberCount: 7,
    openTickets: 12,
    unansweredTickets: 3,
    closedTickets: 47,
    color: "#5BE0A8",
    description: "مدیریت امور مالی و حسابداری مشتریان",
  },
  {
    id: 2,
    name: "سفرهای داخلی",
    manager: "علی احمدی",
    managerAvatar: "https://ui-avatars.com/api/?background=59D8C3&color=06110F&name=علی&length=2&font-size=0.24&size=80",
    managerStatus: "offline",
    managerPhone: "09123456788",
    managerEmail: "ali.ahmadi@example.com",
    status: "active",
    memberCount: 6,
    openTickets: 19,
    unansweredTickets: 8,
    closedTickets: 52,
    color: "#59D8C3",
    description: "مدیریت رزرو و برنامه‌ریزی سفرهای داخلی",
  },
  {
    id: 3,
    name: "سفرهای خارجی",
    manager: "نیلوفر کریمی",
    managerAvatar: "https://ui-avatars.com/api/?background=59D8C3&color=06110F&name=نیلوفر&length=3&font-size=0.2&size=80",
    managerStatus: "online",
    managerPhone: "09123456787",
    managerEmail: "niloo.karimi@example.com",
    status: "active",
    memberCount: 5,
    openTickets: 14,
    unansweredTickets: 7,
    closedTickets: 38,
    color: "#4CAF50",
    description: "مدیریت ویزا و رزرو سفرهای خارجی",
  },
  {
    id: 4,
    name: "پشتیبانی فنی",
    manager: "رضا نادری",
    managerAvatar: "https://ui-avatars.com/api/?background=59D8C3&color=06110F&name=رضا&length=2&font-size=0.24&size=80",
    managerStatus: "offline",
    managerPhone: "09123456786",
    managerEmail: "reza.naderi@example.com",
    status: "inactive",
    memberCount: 4,
    openTickets: 7,
    unansweredTickets: 3,
    closedTickets: 21,
    color: "#FF9800",
    description: "پشتیبانی فنی سایت و اپلیکیشن",
  },
];

const membersData: Record<number, DepartmentMember[]> = {
  1: [
    { id: 1, name: "مریم رضایی", email: "maryam.rezaei@example.com", role: "مدیر", assignedTickets: 5, status: "online" },
    { id: 2, name: "سارا محمدی", email: "sara.m@example.com", role: "کارشناس", assignedTickets: 3, status: "online" },
    { id: 3, name: "علی احمدی", email: "ali.ah@example.com", role: "کارشناس", assignedTickets: 2, status: "offline" },
    { id: 4, name: "نیلوفر کریمی", email: "niloo.k@example.com", role: "کارمند", assignedTickets: 1, status: "online" },
    { id: 5, name: "زهرا محمدی", email: "zahra.m@example.com", role: "کارمند", assignedTickets: 1, status: "offline" },
  ],
  2: [
    { id: 6, name: "احمد رضایی", email: "ahmad.r@example.com", role: "مدیر", assignedTickets: 4, status: "online" },
    { id: 7, name: "سارا کریمی", email: "sara.k@example.com", role: "کارشناس", assignedTickets: 2, status: "offline" },
  ],
};

export default function DepartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = parseInt(params.id as string);

  const [department, setDepartment] = useState<Department | null>(null);
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  useEffect(() => {
    const foundDepartment = departmentsData.find((d) => d.id === departmentId);
    if (foundDepartment) {
      setDepartment(foundDepartment);
      setMembers(membersData[departmentId] || []);
    }
  }, [departmentId]);

  const handleAddMember = (data: { name: string; username: string; password: string }) => {
    console.log("عضو جدید به دپارتمان:", department?.name, data);
    // بعداً اینجا می‌توانید عضو را به API اضافه کنید
    // پس از اضافه شدن، می‌توانید عضو را به لیست اعضا اضافه کنید
    if (department) {
      const newMember: DepartmentMember = {
        id: members.length + 10,
        name: data.name,
        email: `${data.username}@example.com`,
        role: "کارمند",
        assignedTickets: 0,
        status: "offline",
      };
      setMembers([...members, newMember]);
    }
  };

  if (!department) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-400">دپارتمان مورد نظر یافت نشد</p>
          <Link href="/dashboard/departments" className="text-[#59D8C3] hover:underline mt-4 inline-block">
            بازگشت به دپارتمان‌ها
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* هدر صفحه با دکمه برگشت */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/departments"
            className="flex items-center gap-2 text-gray-400 text-sm hover:text-[#59D8C3] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>بازگشت به دپارتمان‌ها</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/departments/${departmentId}/edit`}
              className="px-4 py-2 bg-[#59D8C3]/10 hover:bg-[#59D8C3]/20 text-[#59D8C3] text-sm rounded-2xl transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              <span>ویرایش دپارتمان</span>
            </Link>
            <button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="px-4 py-2 bg-[#59bfd8] text-[#06110F] text-sm rounded-2xl flex items-center gap-2 hover:shadow-lg transition-all duration-300"
            >
              <UserPlus className="w-4 h-4" />
              <span>افزودن عضو جدید</span>
            </button>
          </div>
        </div>

        {/* عنوان دپارتمان */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${department.color}20` }}
          >
            <Building2 className="w-8 h-8" style={{ color: department.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{department.name}</h1>
            <p className="text-gray-400 text-sm mt-1">{department.description}</p>
          </div>
        </div>

        {/* کارت‌های آماری در یک ردیف */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0D1B17] border border-[#59D8C3]/20 rounded-xl p-4 text-center"
          >
            <p className="text-3xl font-bold text-white">{department.memberCount}</p>
            <p className="text-xs text-gray-400">اعضا</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0D1B17] border border-[#59D8C3]/20 rounded-xl p-4 text-center"
          >
            <p className="text-3xl font-bold text-[#59D8C3]">{department.openTickets}</p>
            <p className="text-xs text-gray-400">تیکت باز</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0D1B17] border border-[#59D8C3]/20 rounded-xl p-4 text-center"
          >
            <p className="text-3xl font-bold text-red-400">{department.unansweredTickets}</p>
            <p className="text-xs text-gray-400">بی‌پاسخ</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0D1B17] border border-[#59D8C3]/20 rounded-xl p-4 text-center"
          >
            <p className="text-3xl font-bold text-white">{department.closedTickets}</p>
            <p className="text-xs text-gray-400">بسته شده</p>
          </motion.div>
        </div>

        {/* بخش مدیر دپارتمان */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#0D1B17] border border-[#59D8C3]/20 rounded-xl overflow-hidden"
        >
          <div className="p-5 border-b border-[#59D8C3]/20 bg-gradient-to-r from-[#1a3833]/30 to-transparent">
            <h3 className="text-lg font-semibold text-white">مدیر دپارتمان</h3>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={department.managerAvatar}
                  alt={department.manager}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#59D8C3]"
                />
                <div
                  className={`absolute -bottom-1 left-0 w-3.5 h-3.5 rounded-full border-2 border-[#0D1B17] ${department.managerStatus === "online" ? "bg-green-500" : "bg-gray-500"}`}
                />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{department.manager}</p>
                <p className="text-[#59D8C3] text-sm">مدیر دپارتمان</p>
                <div className={`flex items-center gap-1 mt-1 text-xs ${department.managerStatus === "online" ? "text-green-400" : "text-gray-400"}`}>
                  {department.managerStatus === "online" ? (
                    <>
                      <div className="w-3 h-3 rounded-full border-2 border-[#0D1B17] bg-green-500" />
                      <span>آنلاین</span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 rounded-full border-2 border-[#0D1B17] bg-gray-500" />
                      <span>آفلاین</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* بخش اعضای دپارتمان */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#0D1B17] border border-[#59D8C3]/20 rounded-xl overflow-hidden"
        >
          <div className="p-5 border-b border-[#59D8C3]/20 bg-gradient-to-r from-[#1a3833]/30 to-transparent gap-1 flex items-center justify-start">
            <h3 className="text-lg font-semibold text-white">اعضای دپارتمان</h3>
            <span className="text-sm text-[#59D8C3]">({members.length} نفر)</span>
          </div>
          <div className="divide-y divide-[#59D8C3]/10">
            {members.map((member) => (
              <div key={member.id} className="p-4 hover:bg-[#12251F] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#59D8C3]/20 to-[#5BE0A8]/20 flex items-center justify-center">
                        <span className="text-[#59D8C3] font-bold text-sm">{member.name.charAt(0)}</span>
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0D1B17] ${member.status === "online" ? "bg-green-500" : "bg-gray-500"}`} />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{member.name}</p>
                      <p className="text-gray-500 text-xs">{member.email.split("@")[0]}@</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-[#59D8C3] text-xs font-medium">{member.role}</p>
                    <p className="text-gray-500 text-xs">{member.assignedTickets} تیکت</p>
                  </div>
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>هیچ عضوی در این دپارتمان وجود ندارد</p>
                <button
                  onClick={() => router.push(`/dashboard/departments/${departmentId}/add-member`)}
                  className="mt-3 text-[#59D8C3] text-sm hover:underline"
                >
                  افزودن عضو جدید
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* مودال افزودن عضو جدید */}
      <AddMemberToDepartmentModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSubmit={handleAddMember}
        departmentName={department.name}
      />
    </DashboardLayout>
  );
}