// services/api-client.ts

const API_URL = 'http://localhost:3000';

interface RefreshTokenResponse {
  access_token: string;
}

interface ErrorResponse {
  message: string;
  code?: string;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const getTokens = () => {
  if (typeof window === 'undefined') return null;
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  return { accessToken, refreshToken };
};

const getContextToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('contextToken') || localStorage.getItem('x-context-token');
};

const saveTokens = (accessToken: string, refreshToken?: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('userToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `accessToken=${accessToken}; path=/; max-age=${maxAge}`;
  window.dispatchEvent(new CustomEvent('authChange'));
};

const clearSessionAndRedirectToLogin = () => {
  const keysToRemove = [
    'isLoggedIn', 'hasSeenOnboarding', 'userRole', 'userRoleEnglish',
    'userName', 'userToken', 'refreshToken', 'userId', 'userPhone',
    'currentOrganizationId', 'currentWorkspaceId', 'accessToken',
    'organizations', 'currentOrganization', 'currentWorkspace',
    'contextToken', 'x-context-token'
  ];
  keysToRemove.forEach(key => localStorage.removeItem(key));
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.split('=');
    document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
  window.dispatchEvent(new CustomEvent('authChange'));
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

const refreshAccessToken = async (): Promise<string> => {
  const tokens = getTokens();
  if (!tokens?.refreshToken) {
    clearSessionAndRedirectToLogin();
    throw new Error('SESSION_EXPIRED');
  }
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });
  if (!response.ok) {
    clearSessionAndRedirectToLogin();
    throw new Error('SESSION_EXPIRED');
  }
  const data: RefreshTokenResponse = await response.json();
  saveTokens(data.access_token);
  return data.access_token;
};

// ✅ تابع اصلی apiClient با پشتیبانی از FormData
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const tokens = getTokens();
  const contextToken = getContextToken();
  
  const headers: Record<string, string> = {};
  
  // ✅ فقط اگر body FormData نیست، Content-Type را تنظیم کن
  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (options.headers) {
    const optionHeaders = options.headers as Record<string, string>;
    Object.keys(optionHeaders).forEach(key => {
      headers[key] = optionHeaders[key];
    });
  }
  
  if (tokens?.accessToken) {
    headers['Authorization'] = `Bearer ${tokens.accessToken}`;
  }
  
  if (contextToken) {
    headers['x-context-token'] = contextToken;
  }
  
  const makeRequest = async (): Promise<Response> => {
    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  };
  
  let response = await makeRequest();
  
  if (response.status === 401) {
    try {
      const errorData: ErrorResponse = await response.clone().json();
      if (errorData.code === 'TOKEN_EXPIRED' || errorData.message === 'Access token has expired') {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            addRefreshSubscriber((newToken: string) => {
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
        try {
          const newToken = await refreshAccessToken();
          isRefreshing = false;
          onRefreshed(newToken);
          const newHeaders = { ...headers };
          newHeaders['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: newHeaders,
          });
        } catch (refreshError) {
          isRefreshing = false;
          refreshSubscribers = [];
          throw refreshError;
        }
      }
    } catch (e) {
      if ((e as Error).message === 'SESSION_EXPIRED') {
        throw e;
      }
    }
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || `HTTP error! status: ${response.status}`);
    } catch {
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
  }
  
  return response.json();
}

// ✅ متدهای کمکی با پشتیبانی از FormData
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => 
    apiClient<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) => {
    const isFormData = data instanceof FormData;
    return apiClient<T>(endpoint, { 
      ...options, 
      method: 'POST',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  },
  
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