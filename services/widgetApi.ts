// services/widgetApi.ts

const SUPPORT_API_URL = 'http://localhost:3004';

interface WidgetConfigResponse {
  organizationId: number;
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

// تابع دریافت هدرها با توکن
const getHeaders = () => {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const contextToken = typeof window !== 'undefined' ? localStorage.getItem('contextToken') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  if (contextToken) {
    headers['x-context-token'] = contextToken;
  }
  
  return headers;
};

// دریافت تنظیمات فعلی ویجت
export const getCurrentWidgetConfig = async (): Promise<WidgetConfigResponse> => {
  console.log('📤 دریافت تنظیمات ویجت (GET /widget/current)');
  
  const response = await fetch(`${SUPPORT_API_URL}/widget/current`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ خطا در دریافت تنظیمات ویجت:', errorText);
    throw new Error(`خطا در دریافت تنظیمات ویجت: ${response.status} - ${errorText}`);
  }
  
  return response.json();
};

// به‌روزرسانی تنظیمات ویجت
export const updateWidgetConfig = async (data: UpdateWidgetRequest): Promise<WidgetConfigResponse> => {
  console.log('📤 به‌روزرسانی تنظیمات ویجت (PATCH /widget):', data);
  
  const response = await fetch(`${SUPPORT_API_URL}/widget`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ خطا در به‌روزرسانی تنظیمات ویجت:', errorText);
    throw new Error(`خطا در به‌روزرسانی تنظیمات ویجت: ${response.status} - ${errorText}`);
  }
  
  return response.json();
};