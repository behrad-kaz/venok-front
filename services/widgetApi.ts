// services/widgetApi.ts
import { api } from './api-client';

const API_URL = 'http://localhost:3000';

interface WidgetConfigResponse {
  id: number;
  workspaceId: number;
  widgetToken: string;
  companyName: string;
  logoUrl: string | null;
  primaryColor: string;
  buttonPosition: "bottom-right" | "bottom-left";
  buttonSize: "sm" | "md" | "lg";
  formTitle: string;
  formDescription: string;
  phonePlaceholder: string;
  submitButtonText: string;
  successMessage: string;
  privacyText: string;
  showDepartmentSelect: boolean;
  showDescriptionField: boolean;
  descriptionRequired: boolean;
  allowedDomains: string[];
  isActive: boolean;
  departments: {
    id: number;
    name: string;
    description: string;
    color: string;
    isActive: boolean;
  }[];
}

interface UpdateWidgetRequest {
  widgetToken?: string;
  companyName?: string;
  logoUrl?: string | null;
  primaryColor?: string;
  buttonPosition?: string;
  buttonSize?: string;
  formTitle?: string;
  formDescription?: string;
  phonePlaceholder?: string;
  submitButtonText?: string;
  successMessage?: string;
  privacyText?: string;
  showDepartmentSelect?: boolean;
  showDescriptionField?: boolean;
  descriptionRequired?: boolean;
  isActive?: boolean;
  allowedDomains?: string[];
  supportTeamIds?: number[];
}

// دریافت تنظیمات فعلی ویجت
export const getCurrentWidgetConfig = async (): Promise<WidgetConfigResponse> => {
  console.log('📤 دریافت تنظیمات ویجت (GET /widget/current)');
  
  return api.get<WidgetConfigResponse>('/widget/current');
};

// به‌روزرسانی تنظیمات ویجت
export const updateWidgetConfig = async (data: UpdateWidgetRequest): Promise<WidgetConfigResponse> => {
  console.log('📤 به‌روزرسانی تنظیمات ویجت (PATCH /widget):', data);
  
  return api.patch<WidgetConfigResponse>('/widget', data);
};