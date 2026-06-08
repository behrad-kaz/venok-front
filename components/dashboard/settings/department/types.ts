// components/dashboard/settings/department/types.ts

export type TabType = "info" | "messages" | "hours" | "rules";

export interface DepartmentInfo {
  name: string;
  description: string;
  status: boolean;
  manager: string;
  memberCount: number;
  openTickets: number;
}

export interface DepartmentMessages {
  welcome: string;
  waiting: string;
  outOfHours: string;
  closed: string;
}

export interface WorkingHours {
  useWorkspaceHours: boolean;  // اضافه شده
  enabled: boolean;
  startTime: string;
  endTime: string;
  timezone: string;
  workingDays: {
    saturday: boolean;
    sunday: boolean;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
  };
  outOfHoursMessage: string;
}

export interface TabItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}