// utils/api-client.ts
import { authService } from "@/services/auth.service";

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  requiresContext?: boolean;
}

class ApiClient {
  private static instance: ApiClient;
  private readonly API_URL = 'http://localhost:3001';

  private constructor() {}

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private getHeaders(requiresAuth: boolean = true, requiresContext: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = authService.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    if (requiresContext) {
      const contextToken = localStorage.getItem('contextToken');
      if (contextToken) {
        headers['x-context-token'] = contextToken;
      }
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = true, requiresContext = true, ...fetchOptions } = options;
    
    const headers = {
      ...this.getHeaders(requiresAuth, requiresContext),
      ...fetchOptions.headers,
    };

    const response = await fetch(`${this.API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, requiresAuth: boolean = true, requiresContext: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth, requiresContext });
  }

  async post<T>(endpoint: string, data?: unknown, requiresAuth: boolean = true, requiresContext: boolean = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth,
      requiresContext,
    });
  }

  async put<T>(endpoint: string, data?: unknown, requiresAuth: boolean = true, requiresContext: boolean = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth,
      requiresContext,
    });
  }

  async delete<T>(endpoint: string, requiresAuth: boolean = true, requiresContext: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth, requiresContext });
  }

  async patch<T>(endpoint: string, data?: unknown, requiresAuth: boolean = true, requiresContext: boolean = true): Promise<T> {
  return this.request<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
    requiresAuth,
    requiresContext,
  });
}
}

export const apiClient = ApiClient.getInstance();