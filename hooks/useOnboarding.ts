// hooks/useOnboarding.ts
import { useState, useEffect } from 'react';
import { useOnboardingStore, WorkspaceData } from '@/stores/useOnboardingStore';
import {
  createWorkspace,
  updateWorkspace,
  uploadLogo,
  updateOrganization,
  getTokens,
  saveWorkspaceToStorage,
  CreateWorkspaceWithLogoDto,
  getFullImageUrl,
} from '@/services/onboardingApi';
import { api } from '@/services/api-client';

interface OrganizationPayload {
  name: string;
  legalName: string;
  slug: string;
  type: string;
  legalType: string;
  nationalId: string;
  taxId: string;
  website: string;
  description: string;
  currency: string;
  locale: string;
  logo: string;
}

export function useOnboarding() {
  const {
    companyInfo,
    workspaceData,
    workspaceId,
    isSaving,
    uploadStatus,
    uploadError,
    setCompanyInfo,
    setWorkspaceData,
    setWorkspaceId,
    setIsSaving,
    setUploadStatus,
    setUploadError,
  } = useOnboardingStore();

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

  const generateCode = (name: string): string => {
    const baseName = name.trim() || 'workspace';
    const code = baseName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 10);
    return `${code}-${Date.now().toString().slice(-4)}`;
  };

  const isLogoValid = (logo: File | null): logo is File => {
    return logo !== null && logo !== undefined && logo instanceof File;
  };

  // ✅ بارگذاری اطلاعات workspace 
  const loadInitialData = async () => {
    try {
      const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      
      if (!savedWorkspaceId) {
        console.log('ℹ️ هیچ workspace ای در localStorage یافت نشد');
        return;
      }

      console.log('🔄 دریافت اطلاعات workspace از API...');
      try {
        const workspaceData = await api.get<{ 
          id: number; 
          name: string; 
          phone: string | null; 
          email: string | null;
          logo?: string | null;
        }>(`/workspace/${savedWorkspaceId}`);
        
        console.log('📡 اطلاعات workspace دریافت شد:', workspaceData);
        
        if (workspaceData) {
          // ✅ استفاده از getFullImageUrl برای دریافت آدرس کامل لوگو
          const fullLogoUrl = getFullImageUrl(workspaceData.logo);
          
          setCompanyInfo({
            name: workspaceData.name || '',
            phone: workspaceData.phone || '',
            email: workspaceData.email || '',
            logoUrl: fullLogoUrl,
            logo: fullLogoUrl,
            logoPreview: null,
            logoId: null,
            description: '',
            domain: '',
          });

          if (fullLogoUrl) {
            localStorage.setItem("companyLogo", fullLogoUrl);
          }

          setWorkspaceId(String(workspaceData.id));
          console.log('✅ اطلاعات workspace با موفقیت بارگذاری شد');
        }
      } catch (error) {
        console.warn('⚠️ خطا در دریافت workspace:', error);
        localStorage.removeItem('currentWorkspaceId');
        localStorage.removeItem('currentWorkspace');
        localStorage.removeItem('workspaceSlug');
        setWorkspaceId(null);
      }

    } catch (error) {
      console.error('❌ خطا در بارگذاری اطلاعات:', error);
    }
  };

  const [isInitialLoaded, setIsInitialLoaded] = useState(false);

  useEffect(() => {
    if (!isInitialLoaded) {
      loadInitialData();
      setIsInitialLoaded(true);
    }
  }, [isInitialLoaded]);

  // ✅ بررسی وجود workspace در دیتابیس
  const verifyWorkspaceExists = async (workspaceId: number | string): Promise<boolean> => {
    try {
      await api.get<{ id: number }>(`/workspace/${workspaceId}`);
      return true;
    } catch (error) {
      console.warn(`⚠️ workspace با ID ${workspaceId} در دیتابیس وجود ندارد`);
      return false;
    }
  };

  // ✅ ذخیره‌سازی اطلاعات (ساخت یا به‌روزرسانی workspace)
  const handleSaveAll = async (): Promise<void> => {
    setIsSaving(true);
    setUploadStatus('idle');
    setUploadError(null);
    
    try {
      console.log('🔄 شروع فرآیند ذخیره‌سازی...');
      
      const { accessToken, contextToken } = getTokens();
      if (!accessToken) throw new Error('توکن معتبر یافت نشد');

      // ✅ بررسی وجود organization
      let orgData = null;
      try {
        orgData = await api.get<{ id: number }>('/organization/by-user');
        console.log('📡 organization موجود:', orgData);
      } catch (orgError) {
        console.error('❌ سازمانی برای این کاربر یافت نشد!');
        throw new Error('سازمانی برای این کاربر یافت نشد. لطفاً با ادمین اصلی تماس بگیرید.');
      }

      if (!orgData || !orgData.id) {
        throw new Error('سازمانی برای این کاربر یافت نشد. لطفاً با ادمین اصلی تماس بگیرید.');
      }

      const organizationId = orgData.id;
      console.log(`✅ organizationId: ${organizationId}`);

      const workspaceName = companyInfo.name || 'workspace';
      const slug = generateSlug(workspaceName);
      const code = generateCode(workspaceName);

      let logoFilePath = '';
      const logoFile = companyInfo.logo as File | null;
      
      // ✅ 1. آپلود لوگو (اگر وجود داشته باشد)
      if (isLogoValid(logoFile)) {
        try {
          console.log('🔄 آپلود لوگو...');
          setUploadStatus('uploading');
          
          const uploadResult = await uploadLogo(logoFile, accessToken, contextToken);
          console.log('✅ آپلود لوگو موفق:', uploadResult);
          
          // ✅ استفاده از fullUrl که آدرس کامل است
          const fullLogoUrl = uploadResult.fullUrl || getFullImageUrl(uploadResult.filePath);
          logoFilePath = fullLogoUrl || uploadResult.filePath;
          console.log('📁 آدرس کامل لوگو:', logoFilePath);
          
          setUploadStatus('success');
          
          localStorage.setItem("companyLogo", logoFilePath);
          localStorage.setItem("companyLogoTimestamp", String(Date.now()));
          
        } catch (uploadError) {
          console.error('❌ خطا در آپلود لوگو:', uploadError);
          setUploadStatus('error');
          setUploadError((uploadError as Error).message);
          throw uploadError;
        }
      } else {
        console.log('ℹ️ لوگویی برای آپلود وجود ندارد');
        logoFilePath = companyInfo.logoUrl || '';
      }

      // ✅ 2. بررسی وجود workspace قبلی
      const existingWorkspaceId = workspaceId || localStorage.getItem('currentWorkspaceId');
      let workspaceResult: WorkspaceData | WorkspaceData[] | null = null;
      let shouldCreateNew = true;

      if (existingWorkspaceId) {
        const exists = await verifyWorkspaceExists(existingWorkspaceId);
        
        if (exists) {
          console.log(`🔄 به‌روزرسانی workspace موجود با ID: ${existingWorkspaceId}`);
          
          const updateData = {
            name: workspaceName,
            phone: companyInfo.phone || '',
            email: companyInfo.email || '',
            slug: slug,
            logo: logoFilePath || undefined,
          };
          
          workspaceResult = await updateWorkspace(
            existingWorkspaceId, 
            updateData, 
            accessToken, 
            contextToken
          );
          console.log('✅ به‌روزرسانی workspace موفق:', workspaceResult);
          
          shouldCreateNew = false;
          
          const workspace = Array.isArray(workspaceResult) ? workspaceResult[0] : workspaceResult;
          if (workspace) {
            setWorkspaceData(workspace);
            setWorkspaceId(String(workspace.id));
            saveWorkspaceToStorage(workspace);
            console.log('💾 workspace به‌روزرسانی شد:', workspace);
          }
        } else {
          console.warn(`⚠️ workspace با ID ${existingWorkspaceId} در دیتابیس وجود ندارد، پاک کردن localStorage`);
          localStorage.removeItem('currentWorkspaceId');
          localStorage.removeItem('currentWorkspace');
          localStorage.removeItem('workspaceSlug');
          setWorkspaceId(null);
        }
      }

      if (shouldCreateNew) {
        console.log('🚀 ساخت workspace جدید...');
        
        const workspaceData: CreateWorkspaceWithLogoDto = {
          name: workspaceName,
          phone: companyInfo.phone || '',
          email: companyInfo.email || '',
          slug,
          code,
          address: '',
          city: '',
          postalCode: '',
          timezone: 'Asia/Tehran',
          locale: 'fa-IR',
          logo: logoFilePath,
        };
        
        console.log('📤 داده‌های ارسالی به workspace:', workspaceData);
        
        workspaceResult = await createWorkspace(workspaceData, accessToken, contextToken);
        console.log('✅ ساخت workspace موفق:', workspaceResult);

        const workspace = Array.isArray(workspaceResult) ? workspaceResult[0] : workspaceResult;
        if (workspace) {
          setWorkspaceData(workspace);
          setWorkspaceId(String(workspace.id));
          saveWorkspaceToStorage(workspace);
          console.log('💾 workspace ذخیره شد:', workspace);
        }
      }

      // ✅ 3. به‌روزرسانی organization با لوگو
      console.log('📌 مرحله 3: به‌روزرسانی organization');
      
      const organization = localStorage.getItem('currentOrganization');
      if (organization) {
        const org = JSON.parse(organization);
        
        const updatePayload: OrganizationPayload = {
          name: org.name || workspaceName,
          legalName: org.legalName || workspaceName,
          slug: org.slug || `org-${Date.now()}`,
          type: org.type || 'company',
          legalType: org.legalType || 'individual',
          nationalId: org.nationalId || '',
          taxId: org.taxId || '',
          website: companyInfo.domain || org.website || '',
          description: companyInfo.description || org.description || '',
          currency: org.currency || 'IRR',
          locale: org.locale || 'fa-IR',
          logo: logoFilePath || org.logo || '',
        };
        
        console.log('🔄 به‌روزرسانی organization...');
        console.log('📤 ارسال به organization:', updatePayload);
        
        const updateResult = await updateOrganization(updatePayload, accessToken, contextToken);
        console.log('✅ به‌روزرسانی organization موفق:', updateResult);
        
        if (updateResult && Array.isArray(updateResult) && updateResult.length > 0) {
          const updatedOrg = updateResult[0];
          localStorage.setItem('currentOrganization', JSON.stringify(updatedOrg));
          console.log('✅ currentOrganization به‌روزرسانی شد');
        }
      }
      
      localStorage.setItem("companyName", (companyInfo.name ?? '').toString());
      localStorage.setItem("companyPhone", (companyInfo.phone ?? '').toString());
      localStorage.setItem("companyEmail", (companyInfo.email ?? '').toString());
      
      console.log('✅ همه عملیات با موفقیت انجام شد!');
      
    } catch (error) {
      console.error('❌ خطا در ذخیره‌سازی:', error);
      setUploadStatus('error');
      setUploadError((error as Error).message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    companyInfo,
    workspaceData,
    workspaceId,
    isSaving,
    uploadStatus,
    uploadError,
    
    setCompanyInfo,
    handleSaveAll,
    isWorkspaceLoading: isSaving,
    isLogoLoading: uploadStatus === 'uploading',
  };
}