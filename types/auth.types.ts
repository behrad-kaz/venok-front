// types/auth.types.ts

// مدل توکن
export interface TokenModel {
  accessToken: string;
  refreshToken: string;
}

// مدل کاربر
export interface UserModel {
  id: number;
  password: string;
  mfaType: string;
  status: string;
  phone: string;
  email: string | null;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string;
  invitedAt: string;
  activatedAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  role?: string;
}

// مدل Workspace
export interface WorkspaceModel {
  id: number;
  organizationId: number;
  managerStaffId: number;
  name: string;
  code: string;
  slug: string;
  status: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  latitude: string | null;
  longitude: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// مدل سازمان
export interface OrganizationModel {
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
  workspaces: WorkspaceModel[];
}

// پاسخ کامل لاگین
export interface LoginResponseModel {
  token: TokenModel;
  user: UserModel;
  organizations: OrganizationModel[];
}

// نقش‌های کاربر
export type UserRoleType = 'super_admin' | 'manager' | 'staff';
export type UserRolePersianType = 'مدیر کل' | 'مدیر' | 'کارمند';

// اطلاعات ذخیره شده در localStorage
export interface StoredUserData {
  isLoggedIn: boolean;
  hasSeenOnboarding: boolean;
  userRole: UserRolePersianType;
  userRoleEnglish: UserRoleType;
  userName: string;
  userToken: string;
  refreshToken: string;
  userId: number;
  userPhone: string;
  currentOrganizationId?: number;
  currentWorkspaceId?: number;
  staffId?: number;
  staffRole?: string;
  staffName?: string;
}

// ✅ تایپ جدید برای پاسخ لاگین از بک‌اند
export interface LoginApiResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    mobile: string;
    firstName: string;
    lastName: string;
    role: string; // 'admin' یا 'user'
    avatar: string | null;
    organizationId: number | null;
    staffId: number | null;
    staffRole: string | null;
    staffName: string | null; // ✅ اضافه شد
  };
}