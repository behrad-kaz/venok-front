// hooks/useWorkspaceSettings.ts
import { useState, useCallback, useMemo, useEffect, useLayoutEffect, useRef } from 'react';
import {
  CompanyInfo,
  SupportInfo,
  WorkingHours,
  NotificationSettings,
  SecuritySettings,
  SetupItem,
  Session,
} from '@/components/dashboard/workspace-settings/types';
import {
  updateWorkspace,
  uploadLogo,
  getLogoUrl,
  updateOrganization,
  getTokens,
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

const initialSessions: Session[] = [
  {
    id: "1",
    device: "MacBook Pro",
    deviceType: "desktop",
    browser: "Chrome 118",
    location: "تهران، ایران",
    lastActivity: "الان",
    isCurrent: true,
  },
  {
    id: "2",
    device: "iPhone 15",
    deviceType: "mobile",
    browser: "Safari",
    location: "تهران، ایران",
    lastActivity: "۲ ساعت پیش",
    isCurrent: false,
  },
  {
    id: "3",
    device: "Windows PC",
    deviceType: "desktop",
    browser: "Edge 119",
    location: "اصفهان، ایران",
    lastActivity: "۱ روز پیش",
    isCurrent: false,
  },
];

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

// ✅ تابع دریافت اطلاعات ذخیره شده از localStorage
const getSavedCompanyInfo = (): Partial<CompanyInfo> => {
  if (typeof window === 'undefined') return {};
  
  const savedName = localStorage.getItem("companyName");
  const savedLogo = localStorage.getItem("companyLogo");
  const savedDesc = localStorage.getItem("companyDescription");
  const savedDomain = localStorage.getItem("companyDomain");
  
  return {
    name: savedName || undefined,
    logo: savedLogo || null,
    description: savedDesc || undefined,
    domain: savedDomain || undefined,
  };
};

const getSavedSupportInfo = (): Partial<SupportInfo> => {
  if (typeof window === 'undefined') return {};
  
  const savedPhone = localStorage.getItem("supportPhone");
  const savedEmail = localStorage.getItem("supportEmail");
  const savedAlertPhone = localStorage.getItem("supportAlertPhone");
  const savedIntroText = localStorage.getItem("supportIntroText");
  
  return {
    phone: savedPhone || undefined,
    email: savedEmail || undefined,
    alertPhone: savedAlertPhone || undefined,
    introText: savedIntroText || undefined,
  };
};

// ✅ تابع مقایسه عمیق با تایپ‌های صحیح
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
  const [isSaving, setIsSaving] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isInitialLoadDone = useRef(false);
  
  const [baseCompanyInfo, setBaseCompanyInfo] = useState<CompanyInfo>(getInitialCompanyInfo);
  const [baseSupportInfo, setBaseSupportInfo] = useState<SupportInfo>(getInitialSupportInfo);

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(getInitialCompanyInfo);
  const [supportInfo, setSupportInfo] = useState<SupportInfo>(getInitialSupportInfo);
  const [workingHours, setWorkingHours] = useState<WorkingHours>(initialWorkingHours);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(initialNotificationSettings);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(initialSecuritySettings);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [setupItems, setSetupItems] = useState<SetupItem[]>(initialSetupItems);

  // ✅ بارگذاری اطلاعات از API و localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const workspaceId = localStorage.getItem("currentWorkspaceId");
        if (!workspaceId) {
          console.warn('⚠️ workspaceId یافت نشد');
          return;
        }

        // 1. دریافت اطلاعات workspace از API
        console.log('🔄 دریافت اطلاعات workspace از API...');
        const workspaceData = await api.get<{ 
          id: number; 
          name: string; 
          phone: string | null; 
          email: string | null;
        }>(`/workspace/${workspaceId}`);
        
        console.log('📡 اطلاعات workspace دریافت شد:', workspaceData);

        // 2. دریافت اطلاعات organization از API
        console.log('🔄 دریافت اطلاعات organization از API...');
        const orgData = await api.get<{ 
          logo: string | null;
          description: string | null;
          website: string | null;
          name?: string;
          legalName?: string;
        }>('/organization/current');
        console.log('📡 organization دریافت شد:', orgData);

        // 3. ساخت CompanyInfo از داده‌های دریافتی
        const newCompanyInfo: CompanyInfo = {
          name: workspaceData?.name || orgData?.name || '',
          domain: orgData?.website || '',
          description: orgData?.description || '',
          logo: orgData?.logo || null,
          phone: workspaceData?.phone || '',
          email: workspaceData?.email || '',
          logoFile: null,
        };

        // 4. ساخت SupportInfo
        const newSupportInfo: SupportInfo = {
          phone: workspaceData?.phone || '',
          email: workspaceData?.email || '',
          alertPhone: localStorage.getItem("supportAlertPhone") || '',
          introText: localStorage.getItem("supportIntroText") || '',
        };

        // 5. به‌روزرسانی stateها
        setCompanyInfo(newCompanyInfo);
        setBaseCompanyInfo(newCompanyInfo);
        setSupportInfo(newSupportInfo);
        setBaseSupportInfo(newSupportInfo);
        
        // 6. ذخیره در localStorage
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
        setIsDataLoaded(true);
        isInitialLoadDone.current = true;
      }
    };

    loadData();
  }, []);

  // ✅ تشخیص تغییرات - فقط بعد از بارگذاری اولیه
  // استفاده از isDataLoaded به جای ref در useMemo
  const hasChanges = useMemo(() => {
    if (!isDataLoaded) return false;
    
    const hasCompany = !deepCompare(companyInfo, baseCompanyInfo);
    const hasSupport = !deepCompare(supportInfo, baseSupportInfo);
    const hasHours = !deepCompare(workingHours, initialWorkingHours);
    const hasNotifications = !deepCompare(notificationSettings, initialNotificationSettings);
    const hasSecurity = !deepCompare(securitySettings, initialSecuritySettings) || 
                        !deepCompare(sessions, initialSessions);
    const hasSetup = !deepCompare(setupItems, initialSetupItems);
    
    return hasCompany || hasSupport || hasHours || hasNotifications || hasSecurity || hasSetup;
  }, [
    isDataLoaded,
    companyInfo, 
    baseCompanyInfo, 
    supportInfo, 
    baseSupportInfo, 
    workingHours, 
    notificationSettings, 
    securitySettings, 
    sessions, 
    setupItems
  ]);

  // تکمیل آیتم راه‌اندازی
  const handleCompleteSetupItem = useCallback((itemId: string) => {
    setSetupItems(items => items.map(item => 
      item.id === itemId ? { ...item, completed: true } : item
    ));
  }, []);

  // خروج از همه نشست‌ها
  const handleLogoutAll = useCallback(() => {
    const otherSessions = sessions.filter(session => !session.isCurrent);
    
    if (otherSessions.length === 0) {
      alert("هیچ نشست فعال دیگری وجود ندارد");
      return;
    }
    
    const currentSession = sessions.find(session => session.isCurrent === true);
    if (currentSession) {
      setSessions([currentSession]);
      alert(`${otherSessions.length} نشست با موفقیت حذف شد`);
    } else {
      setSessions([]);
      alert("همه نشست‌ها حذف شدند");
    }
  }, [sessions]);

  // خروج از یک نشست خاص
  const handleLogoutSession = useCallback((sessionId: string) => {
    const sessionToRemove = sessions.find(s => s.id === sessionId);
    if (sessionToRemove?.isCurrent) {
      alert("نمی‌توانید از نشست فعلی خارج شوید");
      return;
    }
    
    setSessions(sessions.filter(s => s.id !== sessionId));
    alert("خروج از نشست انجام شد");
  }, [sessions]);

  // بررسی اتصال پیامک
  const handleCheckSmsConnection = useCallback(() => {
    alert("اتصال پیامک برقرار است");
  }, []);

  // ✅ ذخیره تنظیمات
  const handleSave = useCallback(async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    
    try {
      const { accessToken, contextToken } = getTokens();
      if (!accessToken) {
        alert("توکن معتبر یافت نشد. لطفاً دوباره وارد شوید.");
        setIsSaving(false);
        return;
      }

      const workspaceId = localStorage.getItem("currentWorkspaceId");
      if (!workspaceId) {
        alert("شناسه workspace یافت نشد");
        setIsSaving(false);
        return;
      }

      const slug = generateSlug(companyInfo.name);
      
      // 1. به‌روزرسانی workspace
      console.log('📤 ارسال به سرور (PATCH /workspace):', {
        name: companyInfo.name,
        phone: supportInfo.phone || '',
        email: supportInfo.email || '',
        slug: slug,
      });
      
      await updateWorkspace(
        {
          name: companyInfo.name,
          phone: supportInfo.phone || '',
          email: supportInfo.email || '',
          slug: slug,
        },
        accessToken,
        contextToken
      );
      console.log('✅ به‌روزرسانی workspace موفق');

      let newLogoUrl = companyInfo.logo;

      // 2. آپلود لوگو (در صورت وجود)
      const logoFile = companyInfo.logoFile;
      if (logoFile) {
        console.log('🔄 آپلود لوگو...');
        const uploadResult = await uploadLogo(logoFile, accessToken, contextToken);
        const fileResult = await getLogoUrl(uploadResult.id, accessToken, contextToken);
        newLogoUrl = fileResult.url;
        console.log('✅ لوگو آپلود شد:', newLogoUrl);
      }

      // 3. ✅ به‌روزرسانی organization با description و website
      const currentOrganization = localStorage.getItem('currentOrganization');
      if (currentOrganization) {
        const organization = JSON.parse(currentOrganization);
        const slugOrg = generateSlug(companyInfo.name);
        
        // ✅ ساخت payload کامل برای organization
        const updateOrgPayload = {
          name: organization.name || companyInfo.name,
          legalName: organization.legalName || companyInfo.name,
          slug: organization.slug || slugOrg,
          type: organization.type || 'cafe',
          legalType: organization.legalType || 'individual',
          logo: newLogoUrl || organization.logo || '',
          nationalId: organization.nationalId || '',
          taxId: organization.taxId || '',
          website: companyInfo.domain || organization.website || '',
          description: companyInfo.description || organization.description || '',
          currency: organization.currency || 'IRR',
          locale: organization.locale || 'fa-IR',
        };
        
        console.log('📤 ارسال به organization (PATCH /organization):', updateOrgPayload);
        
        const updateResult = await updateOrganization(
          updateOrgPayload,
          accessToken,
          contextToken
        );
        console.log('✅ به‌روزرسانی organization موفق:', updateResult);
        
        if (updateResult && Array.isArray(updateResult) && updateResult.length > 0) {
          const updatedOrg = updateResult[0];
          localStorage.setItem('currentOrganization', JSON.stringify(updatedOrg));
          console.log('✅ currentOrganization به‌روزرسانی شد');
        }
      }

      // 4. ذخیره در localStorage
      localStorage.setItem("companyName", companyInfo.name);
      if (companyInfo.description) {
        localStorage.setItem("companyDescription", companyInfo.description);
      }
      if (companyInfo.domain) {
        localStorage.setItem("companyDomain", companyInfo.domain);
      }
      if (newLogoUrl) {
        localStorage.setItem("companyLogo", newLogoUrl);
      }
      
      localStorage.setItem("supportPhone", supportInfo.phone);
      localStorage.setItem("supportEmail", supportInfo.email);
      localStorage.setItem("supportAlertPhone", supportInfo.alertPhone);
      localStorage.setItem("supportIntroText", supportInfo.introText);
      
      window.dispatchEvent(new CustomEvent('companyUpdated'));
      
      // ✅ به‌روزرسانی base states با مقادیر جدید
      const updatedCompanyInfo: CompanyInfo = {
        ...companyInfo,
        logo: newLogoUrl,
        logoFile: null,
      };
      
      setCompanyInfo(updatedCompanyInfo);
      setBaseCompanyInfo(updatedCompanyInfo);
      
      const updatedSupportInfo: SupportInfo = {
        ...supportInfo,
      };
      
      setSupportInfo(updatedSupportInfo);
      setBaseSupportInfo(updatedSupportInfo);
      
      alert("تنظیمات با موفقیت ذخیره شد");
      
    } catch (error) {
      console.error('❌ خطا در ذخیره‌سازی:', error);
      alert("خطا در ذخیره تنظیمات. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSaving(false);
    }
  }, [companyInfo, supportInfo, isSaving]);

  // لغو تغییرات
  const handleCancel = useCallback(() => {
    const savedCompany = getSavedCompanyInfo();
    const savedSupport = getSavedSupportInfo();
    
    const resetCompanyInfo: CompanyInfo = {
      name: savedCompany.name || baseCompanyInfo.name || "",
      domain: savedCompany.domain || baseCompanyInfo.domain || "",
      description: savedCompany.description || baseCompanyInfo.description || "",
      logo: savedCompany.logo !== undefined ? savedCompany.logo : baseCompanyInfo.logo,
      phone: baseCompanyInfo.phone || "",
      email: baseCompanyInfo.email || "",
      logoFile: null,
    };
    
    const resetSupportInfo: SupportInfo = {
      phone: savedSupport.phone || baseSupportInfo.phone || "",
      email: savedSupport.email || baseSupportInfo.email || "",
      alertPhone: savedSupport.alertPhone || "",
      introText: savedSupport.introText || "",
    };
    
    setCompanyInfo(resetCompanyInfo);
    setBaseCompanyInfo(resetCompanyInfo);
    
    setSupportInfo(resetSupportInfo);
    setBaseSupportInfo(resetSupportInfo);
    
    setWorkingHours(initialWorkingHours);
    setNotificationSettings(initialNotificationSettings);
    setSecuritySettings(initialSecuritySettings);
    setSessions(initialSessions);
    setSetupItems(initialSetupItems);
    alert("تغییرات لغو شد");
  }, [baseCompanyInfo, baseSupportInfo]);

  // محاسبه آمار
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
    sessions,
    setupItems,
    isSaving,
    hasChanges,
    
    setCompanyInfo,
    setSupportInfo,
    setWorkingHours,
    setNotificationSettings,
    setSecuritySettings,
    setSessions,
    setSetupItems,
    
    handleCompleteSetupItem,
    handleLogoutAll,
    handleLogoutSession,
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