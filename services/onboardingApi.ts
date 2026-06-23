// services/onboardingApi.ts
import { WorkspaceData } from '@/stores/useOnboardingStore';
import { api, apiClient } from './api-client';

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
  let managerStaffId = 1;
  
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

  console.log('📤 ارسال به سرور (POST /workspace):', requestBody);

  // استفاده از apiClient
  return api.post<WorkspaceData>('/workspace', requestBody);
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

  console.log('📤 ارسال به سرور (PATCH /workspace):', requestBody);

  // استفاده از apiClient
  return api.patch<WorkspaceData[]>('/workspace', requestBody);
};

// ✅ 3. آپلود لوگو - با استفاده از apiClient برای مدیریت خودکار توکن
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

  // ✅ استفاده از fetch با مدیریت دستی توکن (چون FormData هست و apiClient نمیتونه handle کنه)
  // اما برای مدیریت refresh token، از توکن‌های به‌روز شده استفاده میکنیم
  const getValidToken = async (): Promise<string> => {
    // بررسی اعتبار توکن فعلی
    const currentToken = localStorage.getItem('accessToken');
    if (currentToken) {
      // برای سادگی، فرض میکنیم توکن معتبر است
      // در صورت نیاز، میتونیم اینجا هم refresh رو انجام بدیم
      return currentToken;
    }
    
    // اگر توکن وجود نداشت، از refresh استفاده کن
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await fetch(`${API_URL}/auth/user/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        throw new Error('Refresh failed');
      }
      
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      return data.accessToken;
    } catch (error) {
      console.error('❌ خطا در refresh token:', error);
      throw error;
    }
  };

  // دریافت توکن معتبر
  let validToken = localStorage.getItem('accessToken');
  
  // اگر توکن وجود نداشت یا منقضی شده بود، refresh کن
  if (!validToken) {
    try {
      validToken = await getValidToken();
    } catch (error) {
      console.error('❌ خطا در دریافت توکن معتبر:', error);
      // پاک کردن نشست و ریدایرکت به لاگین
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      throw new Error('SESSION_EXPIRED');
    }
  }

  const headers: HeadersInit = {
    'Authorization': `Bearer ${validToken}`,
  };
  
  // دریافت context token به‌روز
  const contextTokenValue = localStorage.getItem('contextToken') || localStorage.getItem('x-context-token');
  if (contextTokenValue) {
    headers['x-context-token'] = contextTokenValue;
  }

  const response = await fetch(`${API_URL}/uploads`, {
    method: 'POST',
    headers,
    body: formData,
  });

  console.log(`📡 وضعیت آپلود لوگو: ${response.status} ${response.statusText}`);

  // اگر 401 دریافت کردیم، سعی کن refresh کنی و دوباره تلاش کن
  if (response.status === 401) {
    console.log('⚠️ توکن منقضی شده، تلاش برای refresh...');
    
    try {
      const newToken = await getValidToken();
      
      // به‌روزرسانی هدر با توکن جدید
      const newHeaders: HeadersInit = {
        'Authorization': `Bearer ${newToken}`,
      };
      const newContextToken = localStorage.getItem('contextToken') || localStorage.getItem('x-context-token');
      if (newContextToken) {
        newHeaders['x-context-token'] = newContextToken;
      }
      
      // ارسال مجدد درخواست با توکن جدید
      const retryResponse = await fetch(`${API_URL}/uploads`, {
        method: 'POST',
        headers: newHeaders,
        body: formData,
      });
      
      if (!retryResponse.ok) {
        const error = await retryResponse.text();
        console.error('❌ خطای سرور (تلاش مجدد):', error);
        throw new Error(`خطا در آپلود لوگو: ${retryResponse.status} - ${error}`);
      }
      
      return retryResponse.json();
    } catch (refreshError) {
      console.error('❌ خطا در refresh و تلاش مجدد:', refreshError);
      // پاک کردن نشست و ریدایرکت به لاگین
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      throw new Error('SESSION_EXPIRED');
    }
  }

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
  console.log('📤 دریافت URL لوگو:', `/uploads/${logoId}`);
  return api.get<{ id: string; url: string }>(`/uploads/${logoId}`);
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
  console.log('📤 به‌روزرسانی organization:', data);
  return api.patch<OrganizationResponse[]>('/organization', data);
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