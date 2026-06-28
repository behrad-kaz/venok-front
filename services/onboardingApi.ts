// services/onboardingApi.ts
import { WorkspaceData } from '@/stores/useOnboardingStore';
import { api } from './api-client';

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

  return api.patch<WorkspaceData[]>('/workspace', requestBody);
};

// ✅ 3. آپلود لوگو - با مدیریت بهتر خطا و لاگ‌های دقیق
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
    fileType: file.type,
    hasAccessToken: !!accessToken,
    hasContextToken: !!contextToken,
  });

  // ✅ دریافت توکن معتبر
  const getValidToken = async (): Promise<string> => {
    // ✅ استفاده از const به جای let
    const currentToken = localStorage.getItem('accessToken');
    
    if (currentToken) {
      console.log('✅ توکن موجود است (از localStorage)');
      return currentToken;
    }
    
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.error('❌ Refresh token موجود نیست!');
      throw new Error('No refresh token available');
    }
    
    console.log('🔄 تلاش برای refresh token...');
    const response = await fetch(`${API_URL}/auth/user/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) {
      console.error('❌ Refresh failed:', response.status, response.statusText);
      throw new Error('Refresh failed');
    }
    
    const data = await response.json();
    console.log('✅ توکن جدید دریافت شد');
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    return data.accessToken;
  };

  // دریافت توکن معتبر
  let validToken = accessToken;
  
  if (!validToken) {
    try {
      validToken = await getValidToken();
    } catch (error) {
      console.error('❌ خطا در دریافت توکن معتبر:', error);
      throw new Error('SESSION_EXPIRED');
    }
  }

  console.log('🔑 توکن ارسالی:', validToken ? validToken.substring(0, 30) + '...' : '❌ وجود ندارد');

  const headers: HeadersInit = {
    'Authorization': `Bearer ${validToken}`,
  };
  
  const contextTokenValue = contextToken || localStorage.getItem('contextToken') || localStorage.getItem('x-context-token');
  if (contextTokenValue) {
    headers['x-context-token'] = contextTokenValue;
    console.log('🔑 contextToken ارسالی:', contextTokenValue.substring(0, 30) + '...');
  } else {
    console.warn('⚠️ contextToken وجود ندارد!');
  }

  try {
    const response = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers,
      body: formData,
    });

    console.log(`📡 وضعیت آپلود لوگو: ${response.status} ${response.statusText}`);

    // اگر 401 دریافت کردیم، سعی کن refresh کنی
    if (response.status === 401) {
      console.log('⚠️ توکن منقضی شده، تلاش برای refresh...');
      
      try {
        const newToken = await getValidToken();
        
        const newHeaders: HeadersInit = {
          'Authorization': `Bearer ${newToken}`,
        };
        const newContextToken = localStorage.getItem('contextToken') || localStorage.getItem('x-context-token');
        if (newContextToken) {
          newHeaders['x-context-token'] = newContextToken;
        }
        
        const retryResponse = await fetch(`${API_URL}/uploads`, {
          method: 'POST',
          headers: newHeaders,
          body: formData,
        });
        
        if (!retryResponse.ok) {
          const errorText = await retryResponse.text();
          console.error('❌ خطای سرور (تلاش مجدد):', errorText);
          throw new Error(`خطا در آپلود لوگو: ${retryResponse.status} - ${errorText}`);
        }
        
        return retryResponse.json();
      } catch (refreshError) {
        console.error('❌ خطا در refresh و تلاش مجدد:', refreshError);
        throw new Error('SESSION_EXPIRED');
      }
    }

    if (!response.ok) {
      let errorMessage = '';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || JSON.stringify(errorData);
        console.error('❌ خطای سرور (JSON):', errorData);
      } catch {
        errorMessage = await response.text();
        console.error('❌ خطای سرور (Text):', errorMessage);
      }
      throw new Error(`خطا در آپلود لوگو: ${response.status} - ${errorMessage}`);
    }

    const result = await response.json();
    console.log('✅ آپلود لوگو موفق:', result);
    return result;
  } catch (error) {
    console.error('❌ خطا در آپلود لوگو:', error);
    throw error;
  }
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
  
  if (typeof document !== 'undefined') {
    const maxAge = 7 * 24 * 60 * 60;
    document.cookie = `workspaceId=${workspaceData.id}; path=/; max-age=${maxAge}`;
    document.cookie = `workspaceSlug=${workspaceData.slug}; path=/; max-age=${maxAge}`;
  }
};