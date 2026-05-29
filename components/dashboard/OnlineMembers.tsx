// components/dashboard/OnlineMembers.tsx
"use client";

import { motion } from "framer-motion";

interface OnlineMembersProps {
  selectedRole?: string;
}

const onlineMembersList = [
  {
    id: 1,
    name: "مریم رضایی",
    department: "همه دپارتمان‌ها",
    score: "0 تیکت",
    avatar: ""
  },
  {
    id: 2,
    name: "سارا محمدی",
    department: "حسابداری",
    score: "4 تیکت",
    avatar: ""
  },
  {
    id: 3,
    name: "نیلوفر کریمی",
    department: "سفرهای خارجی",
    score: "3 تیکت",
    avatar: ""
  },
  {
    id: 4,
    name: "امیر حسینی",
    department: "حسابداری",
    score: "5 تیکت",
    avatar: ""
  },
  {
    id: 5,
    name: "رضا نادری",
    department: "پشتیبانی فنی",
    score: "2 تیکت",
    avatar: ""
  },
];

const getInitials = (name: string) => {
  const names = name.split(" ");
  if (names.length >= 2) {
    return `${names[0].charAt(0)}${names[1].charAt(0)}`;
  }
  return name.charAt(0);
};

export default function OnlineMembers({ selectedRole }: OnlineMembersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-[#0D1B17] border border-[#59D8C3]/20 rounded-xl overflow-hidden"
    >
      {/* هدر با تعداد اعضای آنلاین */}
      <div className="flex items-center justify-between p-5">
        <h3 className="text-lg font-semibold text-white">اعضای آنلاین</h3>
        <div className="flex gap-0.5 bg-[#1c3f1d57] border border-[#32423d]/80 py-1 px-2 rounded-2xl">
          <div className="relative w-2 h-2 mt-1 bg-[#5BE0A8] rounded-full border-2 border-[#0D1B17] z-10 animate-pulse" />
          <span className="text-[#59D8C3] text-xs font-medium">{onlineMembersList.length} نفر</span>
        </div>
      </div>

      {/* لیست اعضای آنلاین */}
      <div>
        {onlineMembersList.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.05 }}
            className="flex items-center justify-between p-3 hover:bg-[#12251F] transition-colors cursor-pointer"
          >
            {/* سمت راست: آواتار و اطلاعات کاربر */}
            <div className="flex items-center gap-3">
              <div className="relative -bottom-4 right-13 w-3 h-3 bg-[#5BE0A8] rounded-full border-2 border-[#0D1B17] z-10 animate-pulse" />
              <div className="w-10 h-10 bg-[#32423d] border border-[#32423d]/70 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-[#68ddc8] text-sm font-bold">
                  {getInitials(member.name)}
                </span>
              </div>

              {/* اطلاعات کاربر */}
              <div>
                <p className="text-white text-sm font-medium">{member.name}</p>
                <p className="text-gray-400 text-xs">{member.department}</p>
              </div>
            </div>

            {/* سمت چپ: امتیاز/نکات */}
            <div className="text-left">
              <span className="text-gray-400 text-xs font-medium">{member.score}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}