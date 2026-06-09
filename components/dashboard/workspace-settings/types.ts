// components/dashboard/workspace-settings/types.ts

export type WorkspaceTabType = 
  | "company" 
  | "support" 
  | "hours" 
  | "notifications" 
  | "security" 
  | "setup";

export interface CompanyInfo {
  name: string;
  domain: string;
  description: string;
  logo: string | null;
}

export interface SupportInfo {
  phone: string;
  email: string;
  alertPhone: string;
  introText: string;
}

export interface WorkingHours {
  workingDays: {
    saturday: boolean;
    sunday: boolean;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
  };
  startTime: string;
  endTime: string;
  timezone: string;
  outOfHoursMessage: string;
}

export interface NotificationSettings {
  sendLinkSms: boolean;
  sendOtpForPasswordChange: boolean;
  notifyManagerForUnanswered: boolean;
  notifyNewConversations: boolean;
}

export interface SecuritySettings {
  requireStrongPassword: boolean;
  requirePhoneVerificationForPasswordChange: boolean;
  autoLogoutMinutes: number;
}

export interface SetupItem {
  id: string;
  title: string;
  completed: boolean;
  action?: () => void;
}

export interface Session {
  id: string;
  device: string;
  deviceType: "desktop" | "mobile" | "tablet";
  browser: string;
  location: string;
  lastActivity: string;
  isCurrent?: boolean;
}