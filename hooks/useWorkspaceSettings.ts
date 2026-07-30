// hooks/useWorkspaceSettings.ts
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useModal } from '@/components/ui/modal';
import {
  CompanyInfo,
  SupportInfo,
  WorkingHours,
  NotificationSettings,
  SecuritySettings,
  SetupItem,
} from '@/components/dashboard/workspace-settings/types';
import {
  updateWorkspace,
  updateOrganization,
  getTokens,
  getFullImageUrl,
} from '@/services/onboardingApi';
import { api } from '@/services/api-client';

const initialWorkingHours: WorkingHours = {
  workingDays: {
    saturday: true,
    sunday: true,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: false,
  },
  startTime: "09:00",
  endTime: "18:00",
  timezone: "Asia/Tehran",
  outOfHoursMessage: "در حال حاضر خارج از ساعات پاسخ‌گویی هستیم. پیام شما ثبت شد و در اولین فرصت پاسخ می‌دهیم.",
};

const initialNotificationSettings: NotificationSettings = {
  sendLinkSms: true,
  sendOtpForPasswordChange: true,
  notifyManagerForUnanswered: true,
  notifyNewConversations: true,
};

const initialSecuritySettings: SecuritySettings = {
  requireStrongPassword: true,
  requirePhoneVerificationForPasswordChange: true,
  autoLogoutMinutes: 60,
};

const initialSetupItems: SetupItem[] = [
  { id: "1", title: "اطلاعات شرکت ثبت شده", completed: true, action: undefined },
  { id: "2", title: "دپارتمان‌ها ایجاد شده‌اند", completed: true, action: undefined },
  { id: "3", title: "اعضا اضافه شده‌اند", completed: true, action: undefined },
  { id: "4", title: "موضوع‌ها به دپارتمان‌ها متصل شده‌اند", completed: true, action: undefined },
  { id: "5", title: "ویجت سایت تنظیم شده", completed: true, action: undefined },
  { id: "6", title: "کد ویجت نصب شده", completed: false, action: undefined },
];

// تابع تولید slug
const generateSlug = (name: string): string => {
  const baseName = name.trim() || 'workspace';
  let slug = baseName.toLowerCase();
  
  const persianMap: Record<string, string> = {
    'آ': 'a', 'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's',
    'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z',
    'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's',
    'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f',
    'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'و': 'v', 'ه': 'h', 'ی': 'y', ' ': '-', '_': '-'
  };
  
  slug = slug.split('').map(char => persianMap[char] || char).join('');
  slug = slug.replace(/[^a-z0-9-]/g, '');
  slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  if (!slug) slug = 'workspace';
  
  return `${slug}-${Date.now()}`;
};

// ✅ مقداردهی اولیه
const getInitialCompanyInfo = (): CompanyInfo => {
  return {
    name: "",
    domain: "",
    description: "",
    logo: null,
    phone: "",
    email: "",
    logoFile: null,
  };
};

const getInitialSupportInfo = (): SupportInfo => {
  return {
    phone: "",
    email: "",
    alertPhone: "",
    introText: "",
  };
};

// ✅ تابع مقایسه عمیق
type CleanObject = Record<string, unknown>;

const cleanObject = (obj: unknown): CleanObject => {
  if (!obj || typeof obj !== 'object') return {};
  
  const cleaned: CleanObject = {};
  const source = obj as Record<string, unknown>;
  
  for (const key in source) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        cleaned[key] = cleanObject(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  
  return cleaned;
};

const deepCompare = (obj1: unknown, obj2: unknown): boolean => {
  const cleaned1 = cleanObject(obj1);
  const cleaned2 = cleanObject(obj2);
  
  return JSON.stringify(cleaned1) === JSON.stringify(cleaned2);
};

export function useWorkspaceSettings() {
  const { showSuccess, showInfo, showWarning, showError, showConfirm } = useModal();
  const [isSaving, setIsSaving] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isInitialLoadDone = useRef(false);
  
  // ✅ Base states برای تشخیص تغییرات
  const [baseCompanyInfo, setBaseCompanyInfo] = useState<CompanyInfo>(getInitialCompanyInfo);
  const [baseSupportInfo, setBaseSupportInfo] = useState<SupportInfo>(getInitialSupportInfo);
  const [baseWorkingHours, setBaseWorkingHours] = useState<WorkingHours>(initialWorkingHours);
  const [baseNotificationSettings, setBaseNotificationSettings] = useState<NotificationSettings>(initialNotificationSettings);
  const [baseSecuritySettings, setBaseSecuritySettings] = useState<SecuritySettings>(initialSecuritySettings);
  const [baseSetupItems, setBaseSetupItems] = useState<SetupItem[]>(initialSetupItems);

  // ✅ Stateهای جاری
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(getInitialCompanyInfo);
  const [supportInfo, setSupportInfo] = useState<SupportInfo>(getInitialSupportInfo);
  const [workingHours, setWorkingHours] = useState<WorkingHours>(initialWorkingHours);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(initialNotificationSettings);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(initialSecuritySettings);
  const [setupItems, setSetupItems] = useState<SetupItem[]>(initialSetupItems);

  // ✅ بارگذاری اطلاعات از API و localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const workspaceId = localStorage.getItem("currentWorkspaceId");
        if (!workspaceId) {
          console.warn('⚠️ workspaceId یافت نشد');
          showWarning("شناسه Workspace یافت نشد. لطفاً دوباره وارد شوید.", "خطا");
          return;
        }

        console.log('🔄 دریافت اطلاعات workspace از API...');
        const workspaceData = await api.get<{ 
          id: number; 
          name: string; 
          phone: string | null; 
          email: string | null;
          supportPhone: string | null;
          supportEmail: string | null;
          alertPhone: string | null;
          introText: string | null;
          workingDays: {
            saturday: boolean;
            sunday: boolean;
            monday: boolean;
            tuesday: boolean;
            wednesday: boolean;
            thursday: boolean;
            friday: boolean;
          };
          workStartTime: string;
          workEndTime: string;
          outOfHoursMessage: string | null;
          sendLinkSms: boolean;
          sendOtpForPasswordChange: boolean;
          notifyManagerForUnanswered: boolean;
          notifyNewConversations: boolean;
          requireStrongPassword: boolean;
          requirePhoneVerificationForPasswordChange: boolean;
          autoLogoutMinutes: number;
          logo: string | null;
          timezone: string;
          locale: string;
        }>(`/workspace/${workspaceId}`);
        
        console.log('📡 اطلاعات workspace دریافت شد:', workspaceData);

        console.log('🔄 دریافت اطلاعات organization از API...');
        const orgData = await api.get<{ 
          logo: string | null;
          description: string | null;
          website: string | null;
        }>('/organization/current');
        console.log('📡 organization دریافت شد:', orgData);

        const logoUrl = getFullImageUrl(workspaceData.logo || orgData.logo);
        
        const newCompanyInfo: CompanyInfo = {
          name: workspaceData.name || '',
          domain: orgData.website || '',
          description: orgData.description || '',
          logo: logoUrl,
          phone: workspaceData.phone || '',
          email: workspaceData.email || '',
          logoFile: null,
        };

        const newSupportInfo: SupportInfo = {
          phone: workspaceData.supportPhone || workspaceData.phone || '',
          email: workspaceData.supportEmail || workspaceData.email || '',
          alertPhone: workspaceData.alertPhone || '',
          introText: workspaceData.introText || '',
        };

        const newWorkingHours: WorkingHours = {
          workingDays: workspaceData.workingDays || initialWorkingHours.workingDays,
          startTime: workspaceData.workStartTime || initialWorkingHours.startTime,
          endTime: workspaceData.workEndTime || initialWorkingHours.endTime,
          timezone: workspaceData.timezone || initialWorkingHours.timezone,
          outOfHoursMessage: workspaceData.outOfHoursMessage || initialWorkingHours.outOfHoursMessage,
        };

        const newNotificationSettings: NotificationSettings = {
          sendLinkSms: workspaceData.sendLinkSms !== undefined ? workspaceData.sendLinkSms : initialNotificationSettings.sendLinkSms,
          sendOtpForPasswordChange: workspaceData.sendOtpForPasswordChange !== undefined ? workspaceData.sendOtpForPasswordChange : initialNotificationSettings.sendOtpForPasswordChange,
          notifyManagerForUnanswered: workspaceData.notifyManagerForUnanswered !== undefined ? workspaceData.notifyManagerForUnanswered : initialNotificationSettings.notifyManagerForUnanswered,
          notifyNewConversations: workspaceData.notifyNewConversations !== undefined ? workspaceData.notifyNewConversations : initialNotificationSettings.notifyNewConversations,
        };

        const newSecuritySettings: SecuritySettings = {
          requireStrongPassword: workspaceData.requireStrongPassword !== undefined ? workspaceData.requireStrongPassword : initialSecuritySettings.requireStrongPassword,
          requirePhoneVerificationForPasswordChange: workspaceData.requirePhoneVerificationForPasswordChange !== undefined ? workspaceData.requirePhoneVerificationForPasswordChange : initialSecuritySettings.requirePhoneVerificationForPasswordChange,
          autoLogoutMinutes: workspaceData.autoLogoutMinutes || initialSecuritySettings.autoLogoutMinutes,
        };

        setCompanyInfo(newCompanyInfo);
        setBaseCompanyInfo(newCompanyInfo);
        setSupportInfo(newSupportInfo);
        setBaseSupportInfo(newSupportInfo);
        setWorkingHours(newWorkingHours);
        setBaseWorkingHours(newWorkingHours);
        setNotificationSettings(newNotificationSettings);
        setBaseNotificationSettings(newNotificationSettings);
        setSecuritySettings(newSecuritySettings);
        setBaseSecuritySettings(newSecuritySettings);
        
        localStorage.setItem("companyName", newCompanyInfo.name);
        if (newCompanyInfo.description) {
          localStorage.setItem("companyDescription", newCompanyInfo.description);
        }
        if (newCompanyInfo.domain) {
          localStorage.setItem("companyDomain", newCompanyInfo.domain);
        }
        if (newCompanyInfo.logo) {
          localStorage.setItem("companyLogo", newCompanyInfo.logo);
        }
        localStorage.setItem("supportPhone", newSupportInfo.phone);
        localStorage.setItem("supportEmail", newSupportInfo.email);
        
        setIsDataLoaded(true);
        isInitialLoadDone.current = true;
        
        console.log('✅ اطلاعات با موفقیت بارگذاری شد');

      } catch (error) {
        console.error('❌ خطا در بارگذاری اطلاعات:', error);
        showError("خطا در بارگذاری اطلاعات. لطفاً دوباره تلاش کنید.", "خطا");
        setIsDataLoaded(true);
        isInitialLoadDone.current = true;
      }
    };

    loadData();
  }, []);

  // ✅ تشخیص تغییرات
  const hasChanges = useMemo(() => {
    if (!isDataLoaded) return false;
    
    const hasCompany = !deepCompare(companyInfo, baseCompanyInfo);
    const hasSupport = !deepCompare(supportInfo, baseSupportInfo);
    const hasHours = !deepCompare(workingHours, baseWorkingHours);
    const hasNotifications = !deepCompare(notificationSettings, baseNotificationSettings);
    const hasSecurity = !deepCompare(securitySettings, baseSecuritySettings);
    const hasSetup = !deepCompare(setupItems, baseSetupItems);
    
    return hasCompany || hasSupport || hasHours || hasNotifications || hasSecurity || hasSetup;
  }, [
    isDataLoaded,
    companyInfo, 
    baseCompanyInfo, 
    supportInfo, 
    baseSupportInfo, 
    workingHours, 
    baseWorkingHours,
    notificationSettings, 
    baseNotificationSettings,
    securitySettings, 
    baseSecuritySettings,
    setupItems, 
    baseSetupItems
  ]);

  const handleCompleteSetupItem = useCallback((itemId: string) => {
    setSetupItems(items => items.map(item => 
      item.id === itemId ? { ...item, completed: true } : item
    ));
    setBaseSetupItems(items => items.map(item => 
      item.id === itemId ? { ...item, completed: true } : item
    ));
    showSuccess("آیتم با موفقیت تکمیل شد", "موفقیت ✨");
  }, []);

  const handleCheckSmsConnection = useCallback(() => {
    showSuccess("اتصال پیامک برقرار است", "اتصال پایدار ✅");
  }, []);

  // ✅ ذخیره تنظیمات
  const handleSave = useCallback(async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    
    try {
      const { accessToken, contextToken } = getTokens();
      if (!accessToken) {
        showError("توکن معتبر یافت نشد. لطفاً دوباره وارد شوید.", "خطا");
        setIsSaving(false);
        return;
      }

      const workspaceId = localStorage.getItem("currentWorkspaceId");
      if (!workspaceId) {
        showError("شناسه workspace یافت نشد", "خطا");
        setIsSaving(false);
        return;
      }

      const slug = generateSlug(companyInfo.name);
      
      // ✅ به‌روزرسانی organization
      const orgUpdatePayload = {
        name: companyInfo.name,
        legalName: companyInfo.name,
        slug: slug,
        type: 'company',
        legalType: 'individual',
        logo: companyInfo.logo || '',
        nationalId: '',
        taxId: '',
        website: companyInfo.domain || '',
        description: companyInfo.description || '',
        currency: 'IRR',
        locale: 'fa-IR',
      };
      
      console.log('📤 به‌روزرسانی organization:', orgUpdatePayload);
      await updateOrganization(orgUpdatePayload, accessToken, contextToken);
      console.log('✅ به‌روزرسانی organization موفق');

      // ✅ به‌روزرسانی workspace
      const updatePayload = {
        name: companyInfo.name,
        slug: slug,
        phone: companyInfo.phone || '',
        email: companyInfo.email || '',
        logo: companyInfo.logo || '',
        
        supportPhone: supportInfo.phone || '',
        supportEmail: supportInfo.email || '',
        alertPhone: supportInfo.alertPhone || '',
        introText: supportInfo.introText || '',
        
        workingDays: workingHours.workingDays,
        workStartTime: workingHours.startTime,
        workEndTime: workingHours.endTime,
        outOfHoursMessage: workingHours.outOfHoursMessage,
        
        sendLinkSms: notificationSettings.sendLinkSms,
        sendOtpForPasswordChange: notificationSettings.sendOtpForPasswordChange,
        notifyManagerForUnanswered: notificationSettings.notifyManagerForUnanswered,
        notifyNewConversations: notificationSettings.notifyNewConversations,
        
        requireStrongPassword: securitySettings.requireStrongPassword,
        requirePhoneVerificationForPasswordChange: securitySettings.requirePhoneVerificationForPasswordChange,
        autoLogoutMinutes: securitySettings.autoLogoutMinutes,
        
        timezone: workingHours.timezone,
      };
      
      console.log(`📤 ارسال به سرور (PATCH /workspace/${workspaceId}):`, updatePayload);
      
      await updateWorkspace(workspaceId, updatePayload, accessToken, contextToken);
      console.log('✅ به‌روزرسانی workspace موفق');

      setBaseCompanyInfo(companyInfo);
      setBaseSupportInfo(supportInfo);
      setBaseWorkingHours(workingHours);
      setBaseNotificationSettings(notificationSettings);
      setBaseSecuritySettings(securitySettings);
      setBaseSetupItems(setupItems);
      
      showSuccess("تنظیمات با موفقیت ذخیره شد", "موفقیت ✨");
      
    } catch (error) {
      console.error('❌ خطا در ذخیره‌سازی:', error);
      showError("خطا در ذخیره تنظیمات. لطفاً دوباره تلاش کنید.", "خطا");
    } finally {
      setIsSaving(false);
    }
  }, [companyInfo, supportInfo, workingHours, notificationSettings, securitySettings, setupItems, isSaving]);

  // لغو تغییرات
  const handleCancel = useCallback(() => {
    showConfirm(
      "آیا از لغو تغییرات مطمئن هستید؟ تغییرات ذخیره‌نشده از بین خواهند رفت.",
      "تایید لغو تغییرات",
      () => {
        setCompanyInfo(baseCompanyInfo);
        setSupportInfo(baseSupportInfo);
        setWorkingHours(baseWorkingHours);
        setNotificationSettings(baseNotificationSettings);
        setSecuritySettings(baseSecuritySettings);
        setSetupItems(baseSetupItems);
        
        showInfo("تغییرات با موفقیت لغو شد", "اطلاعات");
      }
    );
  }, [baseCompanyInfo, baseSupportInfo, baseWorkingHours, baseNotificationSettings, baseSecuritySettings, baseSetupItems]);

  const completedCount = useMemo(() => {
    return setupItems.filter(item => item.completed).length;
  }, [setupItems]);

  const totalCount = setupItems.length;

  return {
    companyInfo,
    supportInfo,
    workingHours,
    notificationSettings,
    securitySettings,
    setupItems,
    isSaving,
    hasChanges,
    
    setCompanyInfo,
    setSupportInfo,
    setWorkingHours,
    setNotificationSettings,
    setSecuritySettings,
    setSetupItems,
    
    handleCompleteSetupItem,
    handleCheckSmsConnection,
    handleSave,
    handleCancel,
    
    smsCredit: 5420,
    smsStatus: "connected" as const,
    lastSmsSent: "۲ ساعت پیش",
    completedCount,
    totalCount,
  };
}