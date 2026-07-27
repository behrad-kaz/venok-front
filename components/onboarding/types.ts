// components/onboarding/types.ts

export interface Department {
  id: number; // ← تغییر به number
  name: string;
  description: string;
  isActive: boolean;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  username: string;
  password: string;
  departmentId: number; // ← تغییر به number
  departmentName: string;
  role: "manager" | "staff";
  status: "active" | "inactive";
  presence: "online" | "offline";
  lastActivity: string;
  openTickets: number;
}

export interface CompanyData {
  companyName: string;
  companyLogo: File | null;
  phone: string;
  email: string;
  domain: string;
}

export interface Step {
  id: number;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}