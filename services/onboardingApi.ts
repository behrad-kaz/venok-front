// services/onboardingApi.ts
import { WorkspaceData } from '@/stores/useOnboardingStore';

const API_URL = 'http://localhost:3001';

// ✅ تعریف تایپ برای پاسخ organization
interface OrganizationResponse {
  id: number;
  ownerUserId: number;
  name: string;
  legalName: string;
  slug: string;
  type: string;
  legalType: string;
  status: string;
  logo: string | null;
  nationalId: string | null;
  taxId: string | null;
  website: string | null;
  currency: string;
  locale: string;
  plan: string;
  subscriptionStatus: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  workspaces?: WorkspaceData[];
}

// تنظیمات پایه برای درخواست‌ها
const getHeaders = (accessToken: string, contextToken?: string | null) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };
  if (contextToken) {
    headers['x-context-token'] = contextToken;
  }
  return headers;
};

// 1. ساخت workspace جدید
export const createWorkspace = async (
  data: {
    name: string;
    phone: string;
    email: string;
    slug: string;
    code: string;
  },
  accessToken: string,
  contextToken?: string | null
): Promise<WorkspaceData> => {
  // دریافت managerStaffId از localStorage
  const currentOrganization = localStorage.getItem('currentOrganization');
  let managerStaffId = 1; // مقدار پیش‌فرض
  
  if (currentOrganization) {
    try {
      const organization = JSON.parse(currentOrganization);
      managerStaffId = organization.ownerUserId || 1;
    } catch (e) {
      console.warn('⚠️ خطا در parse organization:', e);
    }
  }

  const requestBody = {
    managerStaffId: managerStaffId,
    name: data.name,
    code: data.code,
    slug: data.slug,
    phone: data.phone,
    email: data.email,
    address: '',
    city: '',
    postalCode: '',
    locale: 'fa-IR',
  };

  console.log('📤 ارسال به سرور:', {
    url: `${API_URL}/workspace`,
    body: requestBody,
    headers: { ...getHeaders(accessToken, contextToken), 'Content-Type': 'application/json' }
  });

  const response = await fetch(`${API_URL}/workspace`, {
    method: 'POST',
    headers: getHeaders(accessToken, contextToken),
    body: JSON.stringify(requestBody),
  });

  console.log(`📡 وضعیت ساخت workspace: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ خطای سرور:', error);
    throw new Error(`خطا در ساخت workspace: ${response.status} - ${error}`);
  }

  return response.json();
};

// 2. به‌روزرسانی workspace
export const updateWorkspace = async (
  data: {
    name: string;
    phone: string;
    email: string;
    slug: string;
  },
  accessToken: string,
  contextToken?: string | null
): Promise<WorkspaceData[]> => {
  const requestBody = {
    name: data.name,
    slug: data.slug,
    phone: data.phone,
    email: data.email,
  };

  console.log('📤 ارسال به سرور (PATCH):', {
    url: `${API_URL}/workspace`,
    body: requestBody,
  });

  const response = await fetch(`${API_URL}/workspace`, {
    method: 'PATCH',
    headers: getHeaders(accessToken, contextToken),
    body: JSON.stringify(requestBody),
  });

  console.log(`📡 وضعیت به‌روزرسانی workspace: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ خطای سرور:', error);
    throw new Error(`خطا در به‌روزرسانی workspace: ${response.status} - ${error}`);
  }

  return response.json();
};

// 3. آپلود لوگو
export const uploadLogo = async (
  file: File,
  accessToken: string,
  contextToken?: string | null
): Promise<{ id: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('policy', 'ORGANIZATION_LOGO');
  formData.append('visibility', 'PUBLIC');
  formData.append('resourceType', 'ORGANIZATION');
  formData.append('resourceId', '1');
  formData.append('isPrimary', 'true');
  formData.append('sortOrder', '0');

  console.log('📤 آپلود لوگو:', {
    url: `${API_URL}/uploads`,
    fileName: file.name,
    fileSize: file.size,
  });

  const response = await fetch(`${API_URL}/uploads`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      ...(contextToken && { 'x-context-token': contextToken }),
    },
    body: formData,
  });

  console.log(`📡 وضعیت آپلود لوگو: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ خطای سرور:', error);
    throw new Error(`خطا در آپلود لوگو: ${response.status} - ${error}`);
  }

  return response.json();
};

// 4. دریافت URL لوگو
export const getLogoUrl = async (
  logoId: string,
  accessToken: string,
  contextToken?: string | null
): Promise<{ id: string; url: string }> => {
  console.log('📤 دریافت URL لوگو:', {
    url: `${API_URL}/uploads/${logoId}`,
  });

  const response = await fetch(`${API_URL}/uploads/${logoId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      ...(contextToken && { 'x-context-token': contextToken }),
    },
  });

  console.log(`📡 وضعیت دریافت URL: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ خطای سرور:', error);
    throw new Error(`خطا در دریافت URL لوگو: ${response.status} - ${error}`);
  }

  return response.json();
};

// 5. به‌روزرسانی organization
export const updateOrganization = async (
  data: {
    name: string;
    legalName: string;
    slug: string;
    type: string;
    legalType: string;
    logo: string;
    nationalId: string;
    taxId: string;
    website: string;
    currency: string;
    locale: string;
  },
  accessToken: string,
  contextToken?: string | null
): Promise<OrganizationResponse[]> => {
  console.log('📤 به‌روزرسانی organization:', {
    url: `${API_URL}/organization`,
    body: data,
  });

  const response = await fetch(`${API_URL}/organization`, {
    method: 'PATCH',
    headers: getHeaders(accessToken, contextToken),
    body: JSON.stringify(data),
  });

  console.log(`📡 وضعیت به‌روزرسانی organization: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ خطای سرور:', error);
    throw new Error(`خطا در به‌روزرسانی organization: ${response.status} - ${error}`);
  }

  return response.json();
};

// 6. تابع کمکی برای دریافت توکن‌ها
export const getTokens = () => {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const contextToken = typeof window !== 'undefined' ? localStorage.getItem('contextToken') : null;
  return { accessToken, contextToken };
};

// 7. تابع کمکی برای ذخیره اطلاعات در localStorage
export const saveWorkspaceToStorage = (workspaceData: WorkspaceData) => {
  localStorage.setItem('currentWorkspace', JSON.stringify(workspaceData));
  localStorage.setItem('currentWorkspaceId', String(workspaceData.id));
  localStorage.setItem('workspaceSlug', workspaceData.slug);
  
  // تنظیم کوکی
  if (typeof document !== 'undefined') {
    const maxAge = 7 * 24 * 60 * 60;
    document.cookie = `workspaceId=${workspaceData.id}; path=/; max-age=${maxAge}`;
    document.cookie = `workspaceSlug=${workspaceData.slug}; path=/; max-age=${maxAge}`;
  }
};