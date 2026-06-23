// services/api-client.ts

const API_URL = 'http://localhost:3001';

// تایپ برای پاسخ refresh token
interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// تایپ برای خطای توکن منقضی شده
interface ErrorResponse {
  message: string;
  code?: string;
}

// وضعیت درخواست
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// تابع افزودن به صف منتظران
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// تابع اجرای همه callback‌ها با توکن جدید
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// تابع دریافت توکن‌ها از localStorage
const getTokens = () => {
  if (typeof window === 'undefined') return null;
  
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  console.log('🔍 دریافت توکن‌ها از localStorage:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
  });
  
  return { accessToken, refreshToken };
};

// تابع دریافت context token
const getContextToken = () => {
  if (typeof window === 'undefined') return null;
  const contextToken = localStorage.getItem('contextToken') || localStorage.getItem('x-context-token');
  console.log('🔍 دریافت context token:', contextToken ? '✅ موجود' : '❌ وجود ندارد');
  return contextToken;
};

// تابع ذخیره توکن‌های جدید
const saveTokens = (accessToken: string, refreshToken?: string) => {
  if (typeof window === 'undefined') return;
  
  console.log('💾 ذخیره توکن‌های جدید:', {
    accessToken: accessToken.substring(0, 30) + '...',
    hasRefreshToken: !!refreshToken,
  });
  
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('userToken', accessToken);
  
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
  
  // به‌روزرسانی کوکی
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `accessToken=${accessToken}; path=/; max-age=${maxAge}`;
  
  // Dispatch رویداد برای همگام‌سازی
  window.dispatchEvent(new CustomEvent('authChange'));
  
  console.log('✅ توکن‌ها با موفقیت ذخیره شدند');
};

// تابع پاک کردن نشست و ریدایرکت به لاگین
const clearSessionAndRedirectToLogin = () => {
  console.log('🗑️ پاک کردن اطلاعات نشست کاربر...');
  
  const keysToRemove = [
    'isLoggedIn', 'hasSeenOnboarding', 'userRole', 'userRoleEnglish',
    'userName', 'userToken', 'refreshToken', 'userId', 'userPhone',
    'currentOrganizationId', 'currentWorkspaceId', 'accessToken',
    'organizations', 'currentOrganization', 'currentWorkspace',
    'contextToken', 'x-context-token'
  ];
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // حذف کوکی‌ها
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.split('=');
    document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
  
  // Dispatch رویداد برای خروج
  window.dispatchEvent(new CustomEvent('authChange'));
  
  console.log('🔄 ریدایرکت به صفحه لاگین...');
  
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// تابع Refresh Token
const refreshAccessToken = async (): Promise<string> => {
  console.log('🔄 ====== شروع فرآیند Refresh Token ======');
  
  const tokens = getTokens();
  if (!tokens?.refreshToken) {
    console.error('❌ Refresh token موجود نیست!');
    clearSessionAndRedirectToLogin();
    throw new Error('SESSION_EXPIRED');
  }
  
  console.log('📤 ارسال درخواست refresh token به سرور...');
  console.log(`🔑 Refresh token: ${tokens.refreshToken.substring(0, 30)}...`);
  
  const response = await fetch(`${API_URL}/auth/user/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });
  
  console.log(`📡 وضعیت پاسخ refresh: ${response.status} ${response.statusText}`);
  
  // اگر پاسخ موفق نبود
  if (!response.ok) {
    let errorMessage = 'خطا در دریافت توکن جدید';
    
    try {
      const errorData = await response.json();
      console.log(`📋 خطای دریافتی از سرور:`, errorData);
      
      // بررسی کد خطا
      if (errorData.code === 'REFRESH_TOKEN_INVALID' || 
          errorData.message === 'Refresh token is invalid or revoked') {
        console.error('❌ Refresh token نامعتبر یا باطل شده است!');
        errorMessage = 'Refresh token is invalid or revoked';
      } else {
        console.error('❌ Refresh token نیز منقضی شده است یا نامعتبر است');
      }
    } catch (parseError) {
      console.error('❌ خطا در parsing پاسخ سرور:', parseError);
    }
    
    // پاک کردن نشست و ریدایرکت به لاگین
    clearSessionAndRedirectToLogin();
    
    throw new Error('SESSION_EXPIRED');
  }
  
  const data: RefreshTokenResponse = await response.json();
  console.log('✅ توکن جدید با موفقیت دریافت شد');
  console.log(`🔑 AccessToken جدید: ${data.accessToken.substring(0, 30)}...`);
  
  // ذخیره توکن جدید
  saveTokens(data.accessToken, data.refreshToken || undefined);
  
  console.log('✅ ====== فرآیند Refresh Token با موفقیت کامل شد ======');
  
  return data.accessToken;
};

// تابع اصلی fetch با مدیریت خودکار توکن
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  console.log(`📤 ====== درخواست جدید ======`);
  console.log(`📍 مسیر: ${endpoint}`);
  console.log(`📌 متد: ${options.method || 'GET'}`);
  
  const tokens = getTokens();
  const contextToken = getContextToken();
  
  // ساخت headers با استفاده از Record
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // اضافه کردن headers از options
  if (options.headers) {
    const optionHeaders = options.headers as Record<string, string>;
    Object.keys(optionHeaders).forEach(key => {
      headers[key] = optionHeaders[key];
    });
  }
  
  // اضافه کردن Authorization header اگر توکن وجود داره
  if (tokens?.accessToken) {
    headers['Authorization'] = `Bearer ${tokens.accessToken}`;
    console.log('🔑 Authorization header اضافه شد');
  } else {
    console.warn('⚠️ توکن دسترسی وجود ندارد!');
  }
  
  // اضافه کردن context token اگر وجود داره
  if (contextToken) {
    headers['x-context-token'] = contextToken;
    console.log('🔑 x-context-token اضافه شد');
  }
  
  const makeRequest = async (): Promise<Response> => {
    console.log(`🔄 ارسال درخواست به: ${API_URL}${endpoint}`);
    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  };
  
  let response = await makeRequest();
  console.log(`📡 وضعیت پاسخ اولیه: ${response.status} ${response.statusText}`);
  
  // اگر پاسخ 401 بود و خطای توکن منقضی شده
  if (response.status === 401) {
    console.warn('⚠️ دریافت وضعیت 401 (Unauthorized)');
    
    try {
      const errorData: ErrorResponse = await response.clone().json();
      console.log(`📋 خطای دریافتی:`, errorData);
      
      if (errorData.code === 'TOKEN_EXPIRED' || errorData.message === 'Access token has expired') {
        console.log('⏰ توکن منقضی شده است، شروع فرآیند refresh...');
        
        // اگر در حال refresh هستیم، منتظر بمانیم
        if (isRefreshing) {
          console.log('⏳ درخواست دیگر در حال refresh است، منتظر می‌مانم...');
          return new Promise((resolve, reject) => {
            addRefreshSubscriber((newToken: string) => {
              console.log('✅ توکن جدید دریافت شد، ارسال مجدد درخواست...');
              const newHeaders = { ...headers };
              newHeaders['Authorization'] = `Bearer ${newToken}`;
              fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers: newHeaders,
              })
                .then(res => res.json())
                .then(resolve)
                .catch(reject);
            });
          });
        }
        
        isRefreshing = true;
        console.log('🔒 شروع فرآیند refresh (قفل شده)');
        
        try {
          const newToken = await refreshAccessToken();
          isRefreshing = false;
          console.log('🔓 فرآیند refresh کامل شد (قفل باز شد)');
          onRefreshed(newToken);
          
          // درخواست را با توکن جدید تکرار کن
          const newHeaders = { ...headers };
          newHeaders['Authorization'] = `Bearer ${newToken}`;
          console.log('🔄 ارسال مجدد درخواست با توکن جدید...');
          response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: newHeaders,
          });
          console.log(`📡 وضعیت پاسخ مجدد: ${response.status} ${response.statusText}`);
        } catch (refreshError) {
          isRefreshing = false;
          refreshSubscribers = [];
          console.error('❌ فرآیند refresh با خطا مواجه شد:', refreshError);
          
          // اگر refresh token هم منقضی شده، خطا رو به بالا ارسال کن
          if ((refreshError as Error).message === 'SESSION_EXPIRED') {
            // clearSessionAndRedirectToLogin قبلاً در refreshAccessToken انجام شده
            throw new Error('SESSION_EXPIRED');
          }
          throw refreshError;
        }
      }
    } catch (e) {
      // اگر خطا در parsing JSON بود، ممکنه خطای دیگری باشه
      if ((e as Error).message === 'SESSION_EXPIRED') {
        throw e;
      }
      console.warn('⚠️ خطا در پردازش پاسخ 401:', e);
      // اگر خطا نبود، همان پاسخ اولیه رو برگردون
    }
  }
  
  // اگر پاسخ موفق نبود، خطا رو پرتاب کن
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ خطا در درخواست: ${response.status}`, errorText);
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || `HTTP error! status: ${response.status}`);
    } catch {
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
  }
  
  console.log(`✅ درخواست با موفقیت کامل شد (${response.status})`);
  console.log(`=========================================\n`);
  
  // پاسخ موفق
  return response.json();
}

// متدهای کمکی
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => 
    apiClient<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) => 
    apiClient<T>(endpoint, { 
      ...options, 
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) => 
    apiClient<T>(endpoint, { 
      ...options, 
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) => 
    apiClient<T>(endpoint, { 
      ...options, 
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: <T>(endpoint: string, options?: RequestInit) => 
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};