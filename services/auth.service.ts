// services/auth.service.ts
import { LoginResponseModel, StoredUserData, UserRolePersianType, UserRoleType, OrganizationModel, WorkspaceModel, LoginApiResponse } from '@/types/auth.types';
import { api } from './api-client';

// تعریف تایپ برای Context
interface DefaultContext {
  organizationId: number;
  workspaceId: number | null;
  organization: OrganizationModel;
  workspace: WorkspaceModel | null;
}

// تعریف تایپ برای پاسخ سوییچ
interface SwitchContextResponse {
  access_token?: string;
  contextToken?: string;
  [key: string]: unknown;
}

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // ✅ تبدیل نقش انگلیسی به فارسی با پشتیبانی از staffRole
  private getPersianRole(userRole: string, staffRole?: string | null): UserRolePersianType {
    console.log('🔍 getPersianRole - userRole:', userRole, 'staffRole:', staffRole);
    
    // اگر نقش از سرور admin است
    if (userRole === 'admin') {
      return 'مدیر کل';
    }

    // اگر role === 'user' است، از staffRole استفاده کن
    if (userRole === 'user' && staffRole) {
      if (staffRole === 'department_manager') {
        return 'مدیر';
      }
      if (staffRole === 'staff') {
        return 'کارمند';
      }
    }

    // fallback
    return 'کارمند';
  }

  // ✅ تعیین نقش با استفاده از userRole و staffRole
  private determineRole(
    userRole: string,
    staffRole: string | null
  ): { role: UserRoleType; rolePersian: UserRolePersianType } {
    console.log('🔍 determineRole - userRole:', userRole, 'staffRole:', staffRole);
    
    // اگر admin است
    if (userRole === 'admin') {
      return { role: 'super_admin', rolePersian: 'مدیر کل' };
    }

    // اگر user است، از staffRole استفاده کن
    if (userRole === 'user' && staffRole) {
      if (staffRole === 'department_manager') {
        return { role: 'manager', rolePersian: 'مدیر' };
      }
      if (staffRole === 'staff') {
        return { role: 'staff', rolePersian: 'کارمند' };
      }
    }

    // اگر user است اما staffRole وجود ندارد → کارمند
    if (userRole === 'user' && !staffRole) {
      console.log('⚠️ کاربر user است اما staffRole وجود ندارد → کارمند');
      return { role: 'staff', rolePersian: 'کارمند' };
    }

    // fallback
    return { role: 'staff', rolePersian: 'کارمند' };
  }

  // ✅ لاگین کاربر - با دریافت staffId و staffRole از بک‌اند
  async login(username: string, password: string): Promise<LoginResponseModel> {
    console.log('📤 ارسال به سرور (POST /auth/login):', { username });

    const loginData = {
      mobile: username,
      password: password,
    };

    console.log('📤 داده‌های ارسالی:', loginData);

    const response = await api.post<LoginApiResponse>('/auth/login', loginData);

    console.log('📥 پاسخ دریافتی:', response);
    console.log('📥 user.role از پاسخ:', response.user?.role);
    console.log('📥 user.staffId از پاسخ:', response.user?.staffId);
    console.log('📥 user.staffRole از پاسخ:', response.user?.staffRole);
    console.log('📥 user.staffName از پاسخ:', response.user?.staffName);

    // ✅ استفاده از userRole و staffRole
    const { role, rolePersian } = this.determineRole(
      response.user.role || 'user',
      response.user.staffRole || null
    );

    console.log('✅ نقش تعیین شده:', { role, rolePersian });

    // ساخت Organization و Workspace پیش‌فرض
    const defaultOrganization: OrganizationModel = {
      id: 1,
      ownerUserId: response.user.id,
      name: response.user.firstName || 'سازمان',
      legalName: response.user.firstName || 'سازمان',
      slug: 'default',
      type: 'company',
      legalType: 'individual',
      status: 'active',
      logo: response.user.avatar || null,
      nationalId: null,
      taxId: null,
      website: null,
      currency: 'IRR',
      locale: 'fa-IR',
      plan: 'free',
      subscriptionStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      workspaces: [],
    };

    const defaultWorkspace: WorkspaceModel = {
      id: 1,
      organizationId: 1,
      managerStaffId: response.user.id,
      name: 'فضای کاری اصلی',
      code: 'MAIN',
      slug: 'main',
      status: 'active',
      phone: response.user.mobile || null,
      email: response.user.email,
      address: null,
      city: null,
      postalCode: null,
      latitude: null,
      longitude: null,
      timezone: 'Asia/Tehran',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    defaultOrganization.workspaces = [defaultWorkspace];

    const loginResponse: LoginResponseModel = {
      token: {
        accessToken: response.access_token,
        refreshToken: response.access_token,
      },
      user: {
        id: response.user.id,
        password: '',
        mfaType: 'none',
        status: 'active',
        phone: response.user.mobile || response.user.id.toString(),
        email: response.user.email,
        emailVerifiedAt: null,
        phoneVerifiedAt: new Date().toISOString(),
        invitedAt: new Date().toISOString(),
        activatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        role: rolePersian,
      },
      organizations: [defaultOrganization],
    };

    // ✅ ذخیره اطلاعات staff برای استفاده بعدی
    (loginResponse as any).staffId = response.user.staffId;
    (loginResponse as any).staffRole = response.user.staffRole;
    (loginResponse as any).staffName = response.user.staffName;
    (loginResponse as any).rawRole = response.user.role;
    (loginResponse as any).firstName = response.user.firstName;
    (loginResponse as any).lastName = response.user.lastName;

    return loginResponse;
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
    console.log('📤 ارسال به سرور (POST /workspace/switch):', { organizationId, workspaceId });
    return api.post<SwitchContextResponse>('/workspace/switch', {
      organizationId: organizationId,
      workspaceId: workspaceId || 0
    });
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

    // ✅ دریافت اطلاعات staff از response
    const staffId = (loginResponse as any).staffId || null;
    const staffRole = (loginResponse as any).staffRole || null;
    const staffName = (loginResponse as any).staffName || null;
    const rawRole = (loginResponse as any).rawRole || 'user';
    const firstName = (loginResponse as any).firstName || null;
    const lastName = (loginResponse as any).lastName || null;

    console.log('📦 storeUserData - staffId:', staffId, 'staffRole:', staffRole, 'rawRole:', rawRole);

    // ✅ تعیین نقش با استفاده از rawRole و staffRole
    const { role, rolePersian } = this.determineRole(
      rawRole,
      staffRole
    );

    console.log('📦 storeUserData - نقش نهایی:', { role, rolePersian });

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
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      currentOrganizationId: defaultOrganization?.id,
      currentWorkspaceId: defaultWorkspace?.id,
      staffId: staffId || undefined,
      staffRole: staffRole || undefined,
      staffName: staffName || undefined,
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

    // ✅ ذخیره staffId و staffRole جداگانه
    if (staffId) {
      localStorage.setItem('staffId', String(staffId));
    }
    if (staffRole) {
      localStorage.setItem('staffRole', staffRole);
    }
    if (staffName) {
      localStorage.setItem('staffName', staffName);
    }

    // ✅ ذخیره نقش فارسی در localStorage
    localStorage.setItem('userRole', rolePersian);

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
      window.dispatchEvent(new CustomEvent('roleChanged', { detail: rolePersian }));
    }

    console.log('✅ storeUserData - نقش نهایی ذخیره شده:', rolePersian);

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

      const storedData = this.storeUserData(loginResponse, username);
      console.log("✅ مرحله 2: اطلاعات ذخیره شد - نقش:", storedData.userRole);

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
        const switchResult = await this.switchContext(defaultContext.organizationId, defaultContext.workspaceId || undefined);
        console.log("✅ مرحله 4: سوییچ context موفق");

        if (switchResult?.contextToken) {
          localStorage.setItem("contextToken", switchResult.contextToken);
          localStorage.setItem("x-context-token", switchResult.contextToken);
          document.cookie = `contextToken=${switchResult.contextToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
        }

        if (switchResult?.access_token) {
          localStorage.setItem("accessToken", switchResult.access_token);
          localStorage.setItem("userToken", switchResult.access_token);
        }
      } catch (switchError) {
        console.warn("⚠️ سوییچ context با خطا مواجه شد:", switchError);
      }

      const hasWorkspace = !!defaultContext.workspaceId;
      const redirectPath = hasWorkspace ? "/dashboard" : "/onboarding/workspace";

      console.log(`✅ مرحله 5: مسیر نهایی ${redirectPath} - نقش: ${storedData.userRole}`);

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
      firstName: localStorage.getItem('firstName') || undefined,
      lastName: localStorage.getItem('lastName') || undefined,
      currentOrganizationId: Number(localStorage.getItem('currentOrganizationId')) || undefined,
      currentWorkspaceId: Number(localStorage.getItem('currentWorkspaceId')) || undefined,
      staffId: Number(localStorage.getItem('staffId')) || undefined,
      staffRole: localStorage.getItem('staffRole') || undefined,
      staffName: localStorage.getItem('staffName') || undefined,
    };
  }

  // خروج از سیستم
  logout(): void {
    const keysToRemove = [
      'isLoggedIn', 'hasSeenOnboarding', 'userRole', 'userRoleEnglish',
      'userName', 'userToken', 'refreshToken', 'userId', 'userPhone',
      'firstName', 'lastName',
      'currentOrganizationId', 'currentWorkspaceId', 'accessToken',
      'organizations', 'currentOrganization', 'currentWorkspace',
      'staffId', 'staffRole', 'staffName'
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));

    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });

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

getStaffId(): number | null {
  if (typeof window === 'undefined') return null;
  const staffId = localStorage.getItem('staffId');
  return staffId ? Number(staffId) : null;
}

// ✅ دریافت staffRole کاربر جاری
getStaffRole(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('staffRole');
}

// ✅ دریافت staffName کاربر جاری
getStaffName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('staffName');
}
}

export const authService = AuthService.getInstance();