// components/dashboard/members/types.ts
export interface Member {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  role: "مدیر دپارتمان" | "کارمند";
  departmentId: number;
  departmentName: string;
  status: "active" | "inactive";
  presence: "online" | "offline";
  lastActivity: string;
  openTickets: number;
  avatar?: string;
  staffId?: number; // ✅ اضافه شد
}

export interface Department {
  id: number;
  name: string;
}