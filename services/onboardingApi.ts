// services/onboardingApi.ts
import { WorkspaceData } from "@/stores/useOnboardingStore";
import { api } from "./api-client";
import { config } from "@/lib/config";

const API_URL = config.apiBaseUrl;

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
  description: string | null;
  currency: string;
  locale: string;
  plan: string;
  subscriptionStatus: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  workspaces?: WorkspaceData[];
}

// ✅ تایپ برای پاسخ آپلود
interface UploadResponse {
  success: boolean;
  filename: string;
  filePath: string;
  fullPath: string;
  originalName: string;
  size: number;
  mimetype: string;
  folder: string;
  width: number;
  height: number;
}

// ✅ تایپ برای ایجاد workspace با لوگو
export interface CreateWorkspaceWithLogoDto {
  name: string;
  code: string;
  slug: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  timezone?: string;
  locale?: string;
  logo?: string;
}

// ✅ تابع تبدیل آدرس نسبی به آدرس کامل
export const getFullImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  
  // اگر آدرس کامل است، همان را برگردان
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // اگر با /files/ شروع می‌شود، آدرس کامل را بساز
  if (path.startsWith('/files/')) {
    return `${API_URL}${path}`;
  }
  
  // اگر فقط نام فایل است، مسیر کامل را بساز
  return `${API_URL}/files/${path}`;
};

// ✅ 1. ساخت workspace جدید
export const createWorkspace = async (
  data: CreateWorkspaceWithLogoDto,
  accessToken: string,
  contextToken?: string | null,
): Promise<WorkspaceData> => {
  const requestBody = {
    name: data.name,
    code: data.code,
    slug: data.slug,
    phone: data.phone || "",
    email: data.email || "",
    address: data.address || "",
    city: data.city || "",
    postalCode: data.postalCode || "",
    timezone: data.timezone || "Asia/Tehran",
    locale: data.locale || "fa-IR",
    logo: data.logo || "",
  };

  console.log("📤 ارسال به سرور (POST /workspace):", requestBody);

  return api.post<WorkspaceData>("/workspace", requestBody);
};

// ✅ 2. به‌روزرسانی workspace - با ID
export const updateWorkspace = async (
  workspaceId: number | string,
  data: {
    name: string;
    slug: string;
    phone?: string;
    email?: string;
    logo?: string;
    supportPhone?: string;
    supportEmail?: string;
    alertPhone?: string;
    introText?: string;
    workingDays?: {
      saturday: boolean;
      sunday: boolean;
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
    };
    workStartTime?: string;
    workEndTime?: string;
    outOfHoursMessage?: string;
    sendLinkSms?: boolean;
    sendOtpForPasswordChange?: boolean;
    notifyManagerForUnanswered?: boolean;
    notifyNewConversations?: boolean;
    requireStrongPassword?: boolean;
    requirePhoneVerificationForPasswordChange?: boolean;
    autoLogoutMinutes?: number;
    timezone?: string;
  },
  accessToken: string,
  contextToken?: string | null,
): Promise<WorkspaceData> => {
  const requestBody = {
    name: data.name,
    slug: data.slug,
    phone: data.phone || "",
    email: data.email || "",
    logo: data.logo || "",
    supportPhone: data.supportPhone || "",
    supportEmail: data.supportEmail || "",
    alertPhone: data.alertPhone || "",
    introText: data.introText || "",
    workingDays: data.workingDays || {},
    workStartTime: data.workStartTime || "09:00",
    workEndTime: data.workEndTime || "18:00",
    outOfHoursMessage: data.outOfHoursMessage || "",
    sendLinkSms: data.sendLinkSms !== undefined ? data.sendLinkSms : true,
    sendOtpForPasswordChange: data.sendOtpForPasswordChange !== undefined ? data.sendOtpForPasswordChange : true,
    notifyManagerForUnanswered: data.notifyManagerForUnanswered !== undefined ? data.notifyManagerForUnanswered : true,
    notifyNewConversations: data.notifyNewConversations !== undefined ? data.notifyNewConversations : true,
    requireStrongPassword: data.requireStrongPassword !== undefined ? data.requireStrongPassword : true,
    requirePhoneVerificationForPasswordChange: data.requirePhoneVerificationForPasswordChange !== undefined ? data.requirePhoneVerificationForPasswordChange : true,
    autoLogoutMinutes: data.autoLogoutMinutes || 60,
    timezone: data.timezone || "Asia/Tehran",
  };

  console.log(`📤 ارسال به سرور (PATCH /workspace/${workspaceId}):`, requestBody);

  return api.patch<WorkspaceData>(`/workspace/${workspaceId}`, requestBody);
};

// ✅ 3. آپلود لوگو در پوشه workspaces-logo
export const uploadLogo = async (
  file: File,
  accessToken: string,
  contextToken?: string | null,
): Promise<UploadResponse & { fullUrl: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "workspaces-logo");

  console.log("📤 آپلود لوگو:", {
    url: `${API_URL}/upload/file`,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    folder: "workspaces-logo",
    hasAccessToken: !!accessToken,
    hasContextToken: !!contextToken,
  });

  // دریافت توکن معتبر
  const getValidToken = async (): Promise<string> => {
    const currentToken = localStorage.getItem("accessToken");

    if (currentToken) {
      return currentToken;
    }

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Refresh failed");
    }

    const data = await response.json();
    localStorage.setItem("accessToken", data.access_token);
    return data.access_token;
  };

  let validToken = accessToken;

  if (!validToken) {
    try {
      validToken = await getValidToken();
    } catch (error) {
      console.error("❌ خطا در دریافت توکن معتبر:", error);
      throw new Error("SESSION_EXPIRED");
    }
  }

  const headers: HeadersInit = {
    Authorization: `Bearer ${validToken}`,
  };

  const contextTokenValue =
    contextToken ||
    localStorage.getItem("contextToken") ||
    localStorage.getItem("x-context-token");
  if (contextTokenValue) {
    headers["x-context-token"] = contextTokenValue;
  }

  try {
    const response = await fetch(`${API_URL}/upload/file`, {
      method: "POST",
      headers,
      body: formData,
    });

    console.log(
      `📡 وضعیت آپلود لوگو: ${response.status} ${response.statusText}`,
    );

    if (response.status === 401) {
      console.log("⚠️ توکن منقضی شده، تلاش برای refresh...");

      try {
        const newToken = await getValidToken();

        const newHeaders: HeadersInit = {
          Authorization: `Bearer ${newToken}`,
        };
        const newContextToken =
          localStorage.getItem("contextToken") ||
          localStorage.getItem("x-context-token");
        if (newContextToken) {
          newHeaders["x-context-token"] = newContextToken;
        }

        const retryResponse = await fetch(`${API_URL}/upload/file`, {
          method: "POST",
          headers: newHeaders,
          body: formData,
        });

        if (!retryResponse.ok) {
          const errorText = await retryResponse.text();
          console.error("❌ خطای سرور (تلاش مجدد):", errorText);
          throw new Error(
            `خطا در آپلود لوگو: ${retryResponse.status} - ${errorText}`,
          );
        }

        const result = (await retryResponse.json()) as UploadResponse;
        console.log("✅ آپلود لوگو موفق:", result);
        
        // ✅ برگرداندن آدرس کامل
        return {
          ...result,
          fullUrl: getFullImageUrl(result.filePath) || '',
        };
      } catch (refreshError) {
        console.error("❌ خطا در refresh و تلاش مجدد:", refreshError);
        throw new Error("SESSION_EXPIRED");
      }
    }

    if (!response.ok) {
      let errorMessage = "";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || JSON.stringify(errorData);
        console.error("❌ خطای سرور (JSON):", errorData);
      } catch {
        errorMessage = await response.text();
        console.error("❌ خطای سرور (Text):", errorMessage);
      }
      throw new Error(
        `خطا در آپلود لوگو: ${response.status} - ${errorMessage}`,
      );
    }

    const result = (await response.json()) as UploadResponse;
    console.log("✅ آپلود لوگو موفق:", result);
    
    // ✅ برگرداندن آدرس کامل
    return {
      ...result,
      fullUrl: getFullImageUrl(result.filePath) || '',
    };
  } catch (error) {
    console.error("❌ خطا در آپلود لوگو:", error);
    throw error;
  }
};

// ✅ 4. دریافت URL لوگو
export const getLogoUrl = async (
  logoId: string,
  accessToken: string,
  contextToken?: string | null,
): Promise<{ id: string; url: string }> => {
  console.log("📤 دریافت URL لوگو:", `/upload/${logoId}`);
  return api.get<{ id: string; url: string }>(`/upload/${logoId}`);
};

// ✅ 5. به‌روزرسانی organization
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
    description: string;
    currency: string;
    locale: string;
  },
  accessToken: string,
  contextToken?: string | null,
): Promise<OrganizationResponse[]> => {
  console.log("📤 به‌روزرسانی organization:", data);
  return api.patch<OrganizationResponse[]>("/organization", data);
};

// ✅ 6. تابع کمکی برای دریافت توکن‌ها
export const getTokens = () => {
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const contextToken =
    typeof window !== "undefined" ? localStorage.getItem("contextToken") : null;
  return { accessToken, contextToken };
};

// ✅ 7. تابع کمکی برای ذخیره اطلاعات در localStorage
export const saveWorkspaceToStorage = (workspaceData: WorkspaceData) => {
  localStorage.setItem("currentWorkspace", JSON.stringify(workspaceData));
  localStorage.setItem("currentWorkspaceId", String(workspaceData.id));
  localStorage.setItem("workspaceSlug", workspaceData.slug);

  if (typeof document !== "undefined") {
    const maxAge = 7 * 24 * 60 * 60;
    document.cookie = `workspaceId=${workspaceData.id}; path=/; max-age=${maxAge}`;
    document.cookie = `workspaceSlug=${workspaceData.slug}; path=/; max-age=${maxAge}`;
  }
};