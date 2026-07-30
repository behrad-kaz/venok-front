export type WorkspaceTabType = 
  | "company" 
  | "support" 
  | "hours" 
  | "notifications" 
  | "security" 
  | "setup";

export interface CompanyInfo {
  name: string;
  domain: string; // از organization.website
  description: string; // از organization.description
  logo: string | null; // از organization.logo یا workspace.logo
  phone?: string; // از workspace.phone
  email?: string; // از workspace.email
  logoFile?: File | null; 
}

export interface SupportInfo {
  phone: string; // از workspace.supportPhone
  email: string; // از workspace.supportEmail
  alertPhone: string; // از workspace.alertPhone
  introText: string; // از workspace.introText
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
  startTime: string; // workspace.workStartTime
  endTime: string; // workspace.workEndTime
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
