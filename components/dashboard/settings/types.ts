// components/dashboard/settings/types.ts
export interface CompanyInfoData {
  name: string;
  email: string;
  phone: string;
  website: string;
}

export interface SmsSettingsData {
  senderNumber: string;
  apiKey: string;
  isEnabled: boolean;
  isConnected: boolean;
}

export interface SecuritySettingsData {
  twoFactor: boolean;
  autoClose: boolean;
  emailNotification: boolean;
}