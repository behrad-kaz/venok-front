// components/dashboard/members/types.ts
export type UserRole = "مدیر کل" | "مدیر دپارتمان" | "کارمند پشتیبانی";

export interface Member {
  id: number;
  name: string;
  username: string;
  role: UserRole;
  department: string;
  status: "online" | "offline";
  tickets: number;
  lastActivity: string;
  avatar?: string;
}