// services/auth.service.ts
import { LoginResponseModel, StoredUserData, UserRolePersianType, UserRoleType, OrganizationModel, WorkspaceModel } from '@/types/auth.types';

// تعریف تایپ برای خطا
interface ApiError {
  message?: string;
  status?: number;
  response?: {
    data?: {
      message?: string;
    };
  };
}

// تعریف تایپ برای Context
interface DefaultContext {
  organizationId: number;
  workspaceId: number | null;
  organization: OrganizationModel;
  workspace: WorkspaceModel | null;
}

// تعریف تایپ برای پاسخ سوییچ
interface SwitchContextResponse {
  token?: {
    accessToken: string;
    refreshToken: string;
  };
  [key: string]: unknown;
}

class AuthService {
  private static instance: AuthService;
  private readonly API_URL = 'http://localhost:3001';

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // تبدیل نقش انگلیسی به فارسی
  private getPersianRole(role: UserRoleType): UserRolePersianType {
    const roleMap: Record<UserRoleType, UserRolePersianType> = {
      super_admin: 'مدیر کل',
      manager: 'مدیر',
      staff: 'کارمند',
    };
    return roleMap[role] || 'کارمند';
  }

  // تعیین نقش بر اساس شماره تلفن
  private determineRole(phone: string, username: string): { role: UserRoleType; rolePersian: UserRolePersianType } {
    if (phone === '98920' || username === 'admin') {
      return { role: 'super_admin', rolePersian: 'مدیر کل' };
    }
    if (username === 'manager.support') {
      return { role: 'manager', rolePersian: 'مدیر' };
    }
    return { role: 'staff', rolePersian: 'کارمند' };
  }

  // لاگین کاربر
  async login(username: string, password: string): Promise<LoginResponseModel> {
    const response = await fetch(`${this.API_URL}/auth/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok && response.status !== 201) {
      const error = await response.json() as ApiError;
      throw new Error(error.message || 'خطا در ورود به سیستم');
    }

    const data = await response.json() as LoginResponseModel;
    return data;
  }

  // دریافت workspace و organization پیش‌فرض
  getDefaultContext(): DefaultContext | null {
    if (typeof window === 'undefined') return null;
    
    const organizationsStr = localStorage.getItem("organizations");
    if (!organizationsStr) return null;
    
    const organizations = JSON.parse(organizationsStr) as OrganizationModel[];
    const defaultOrganization = organizations[0];
    const defaultWorkspace = defaultOrganization?.workspaces?.[0] || null;
    
    if (!defaultOrganization) return null;
    
    return {
      organizationId: defaultOrganization.id,
      workspaceId: defaultWorkspace?.id || null,
      organization: defaultOrganization,
      workspace: defaultWorkspace
    };
  }

  // سوییچ context
  async switchContext(organizationId: number, workspaceId?: number): Promise<SwitchContextResponse> {
    const accessToken = this.getAccessToken();
    
    if (!accessToken) {
      throw new Error("توکن معتبر یافت نشد");
    }
    
    const response = await fetch(`${this.API_URL}/account/context/switch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        actorType: "staff",
        organizationId: organizationId,
        workspaceId: workspaceId || 0
      }),
    });
    
    if (!response.ok && response.status !== 200 && response.status !== 201) {
      const error = await response.json().catch(() => ({})) as ApiError;
      throw new Error(error.message || "خطا در تغییر context");
    }
    
    const data = await response.json() as SwitchContextResponse;
    
    // به‌روزرسانی توکن در صورت وجود
    if (data?.token) {
      this.updateToken(data.token);
    }
    
    return data;
  }

  // به‌روزرسانی توکن
  private updateToken(token: { accessToken: string; refreshToken: string }): void {
    localStorage.setItem("accessToken", token.accessToken);
    localStorage.setItem("refreshToken", token.refreshToken);
    localStorage.setItem("userToken", token.accessToken);
    
    const maxAge = 60 * 60 * 24 * 7;
    document.cookie = `accessToken=${token.accessToken}; path=/; max-age=${maxAge}`;
  }

  // ذخیره اطلاعات در localStorage و کوکی
  storeUserData(loginResponse: LoginResponseModel, username: string): StoredUserData {
    const { user, token, organizations } = loginResponse;
    const { role, rolePersian } = this.determineRole(user.phone, username);
    
    const defaultOrganization = organizations[0];
    const defaultWorkspace = defaultOrganization?.workspaces?.[0];

    const storedData: StoredUserData = {
      isLoggedIn: true,
      hasSeenOnboarding: true,
      userRole: rolePersian,
      userRoleEnglish: role,
      userName: user.phone || username,
      userToken: token.accessToken,
      refreshToken: token.refreshToken,
      userId: user.id,
      userPhone: user.phone,
      currentOrganizationId: defaultOrganization?.id,
      currentWorkspaceId: defaultWorkspace?.id,
    };

    // ذخیره در localStorage
    Object.entries(storedData).forEach(([key, value]) => {
      if (value !== undefined) {
        localStorage.setItem(key, String(value));
      }
    });

    localStorage.setItem('accessToken', token.accessToken);
    localStorage.setItem('refreshToken', token.refreshToken);
    localStorage.setItem('organizations', JSON.stringify(organizations));
    localStorage.setItem('currentOrganization', JSON.stringify(defaultOrganization));
    localStorage.setItem('currentWorkspace', JSON.stringify(defaultWorkspace));

    const maxAge = 60 * 60 * 24 * 7;
    document.cookie = `isLoggedIn=true; path=/; max-age=${maxAge}`;
    document.cookie = `userRole=${role}; path=/; max-age=${maxAge}`;
    document.cookie = `hasSeenOnboarding=true; path=/; max-age=${maxAge}`;
    document.cookie = `accessToken=${token.accessToken}; path=/; max-age=${maxAge}`;
    document.cookie = `userId=${user.id}; path=/; max-age=${maxAge}`;
    document.cookie = `userPhone=${user.phone}; path=/; max-age=${maxAge}`;
    
    if (defaultOrganization?.id) {
      document.cookie = `organizationId=${defaultOrganization.id}; path=/; max-age=${maxAge}`;
    }
    if (defaultWorkspace?.id) {
      document.cookie = `workspaceId=${defaultWorkspace.id}; path=/; max-age=${maxAge}`;
    }

    // Dispatch رویداد برای همگام‌سازی
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('authChange'));
    }

    return storedData;
  }

  // پردازش کامل بعد از لاگین
  async processAfterLogin(username: string, password: string): Promise<{ 
    success: boolean; 
    hasWorkspace: boolean; 
    redirectPath: string;
    error?: string;
  }> {
    try {
      const loginResponse = await this.login(username, password);
      console.log("✅ مرحله 1: لاگین موفق");
      
      this.storeUserData(loginResponse, username);
      console.log("✅ مرحله 2: اطلاعات ذخیره شد");
      
      const defaultContext = this.getDefaultContext();
      
      if (!defaultContext) {
        return {
          success: false,
          hasWorkspace: false,
          redirectPath: "/onboarding/workspace",
          error: "اطلاعات سازمان یافت نشد"
        };
      }
      
      console.log("✅ مرحله 3: context پیش‌فرض:", defaultContext);
      
      try {
        await this.switchContext(defaultContext.organizationId, defaultContext.workspaceId || undefined);
        console.log("✅ مرحله 4: سوییچ context موفق");
      } catch (switchError) {
        console.warn("⚠️ سوییچ context با خطا مواجه شد:", switchError);
      }
      
      const hasWorkspace = !!defaultContext.workspaceId;
      const redirectPath = hasWorkspace ? "/dashboard" : "/onboarding/workspace";
      
      console.log(`✅ مرحله 5: مسیر نهایی ${redirectPath}`);
      
      return {
        success: true,
        hasWorkspace,
        redirectPath
      };
      
    } catch (error: unknown) {
      console.error("❌ خطا در processAfterLogin:", error);
      
      let errorMessage = "خطا در پردازش درخواست";
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      
      return {
        success: false,
        hasWorkspace: false,
        redirectPath: "/login",
        error: errorMessage
      };
    }
  }

  // دریافت اطلاعات کاربر ذخیره شده
  getStoredUserData(): Partial<StoredUserData> | null {
    if (typeof window === 'undefined') return null;
    
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) return null;

    return {
      isLoggedIn: true,
      hasSeenOnboarding: localStorage.getItem('hasSeenOnboarding') === 'true',
      userRole: localStorage.getItem('userRole') as UserRolePersianType,
      userRoleEnglish: localStorage.getItem('userRoleEnglish') as UserRoleType,
      userName: localStorage.getItem('userName') || '',
      userToken: localStorage.getItem('userToken') || '',
      refreshToken: localStorage.getItem('refreshToken') || '',
      userId: Number(localStorage.getItem('userId')) || 0,
      userPhone: localStorage.getItem('userPhone') || '',
      currentOrganizationId: Number(localStorage.getItem('currentOrganizationId')) || undefined,
      currentWorkspaceId: Number(localStorage.getItem('currentWorkspaceId')) || undefined,
    };
  }

  // خروج از سیستم
  logout(): void {
    const keysToRemove = [
      'isLoggedIn', 'hasSeenOnboarding', 'userRole', 'userRoleEnglish',
      'userName', 'userToken', 'refreshToken', 'userId', 'userPhone',
      'currentOrganizationId', 'currentWorkspaceId', 'accessToken',
      'organizations', 'currentOrganization', 'currentWorkspace'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
    
    // Dispatch رویداد برای همگام‌سازی
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('authChange'));
    }
  }

  // بررسی اعتبار توکن
  isTokenValid(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('accessToken');
    return !!token;
  }

  // دریافت توکن
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  // دریافت refresh token
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  // دریافت سازمان‌های کاربر
  getOrganizations(): OrganizationModel[] | null {
    if (typeof window === 'undefined') return null;
    const orgs = localStorage.getItem('organizations');
    return orgs ? JSON.parse(orgs) as OrganizationModel[] : null;
  }

  // دریافت workspace جاری
  getCurrentWorkspace(): WorkspaceModel | null {
    if (typeof window === 'undefined') return null;
    const workspace = localStorage.getItem('currentWorkspace');
    return workspace ? JSON.parse(workspace) as WorkspaceModel : null;
  }

  // دریافت organization جاری
  getCurrentOrganization(): OrganizationModel | null {
    if (typeof window === 'undefined') return null;
    const organization = localStorage.getItem('currentOrganization');
    return organization ? JSON.parse(organization) as OrganizationModel : null;
  }

  // به‌روزرسانی organization و workspace جاری
  updateCurrentContext(organizationId: number, workspaceId?: number): void {
    const organizations = this.getOrganizations();
    if (!organizations) return;
    
    const organization = organizations.find((org: OrganizationModel) => org.id === organizationId);
    if (organization) {
      localStorage.setItem('currentOrganization', JSON.stringify(organization));
      localStorage.setItem('currentOrganizationId', String(organizationId));
      document.cookie = `organizationId=${organizationId}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }
    
    if (workspaceId && organization?.workspaces) {
      const workspace = organization.workspaces.find((ws: WorkspaceModel) => ws.id === workspaceId);
      if (workspace) {
        localStorage.setItem('currentWorkspace', JSON.stringify(workspace));
        localStorage.setItem('currentWorkspaceId', String(workspaceId));
        document.cookie = `workspaceId=${workspaceId}; path=/; max-age=${60 * 60 * 24 * 7}`;
      }
    }
  }
}

export const authService = AuthService.getInstance();