// hooks/useOnboarding.ts
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOnboardingStore, WorkspaceData } from '@/stores/useOnboardingStore';
import {
  createWorkspace,
  updateWorkspace,
  uploadLogo,
  getLogoUrl,
  updateOrganization,
  getTokens,
  saveWorkspaceToStorage,
} from '@/services/onboardingApi';
import { api } from '@/services/api-client';

interface WorkspaceMutationResult {
  success: boolean;
  data?: WorkspaceData | WorkspaceData[];
}

// ✅ تایپ صحیح برای payload organization
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
  const queryClient = useQueryClient();
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

  const isLogoValid = (logo: File | null): logo is File => {
    return logo !== null && logo !== undefined;
  };

  // ✅ بارگذاری اولیه اطلاعات از API
  const loadInitialData = async () => {
    try {
      const workspaceId = localStorage.getItem("currentWorkspaceId");
      if (!workspaceId) {
        console.warn('⚠️ workspaceId یافت نشد');
        return;
      }

      console.log('🔄 دریافت اطلاعات workspace از API...');
      const workspaceData = await api.get<{ 
        id: number; 
        name: string; 
        phone: string | null; 
        email: string | null;
      }>(`/workspace/${workspaceId}`);
      console.log('📡 اطلاعات workspace دریافت شد:', workspaceData);

      console.log('🔄 دریافت اطلاعات organization از API...');
      const orgData = await api.get<{ 
        logo: string | null;
        description: string | null;
        website: string | null;
        name?: string;
        legalName?: string;
      }>('/organization/current');
      console.log('📡 organization دریافت شد:', orgData);

      setCompanyInfo({
        name: workspaceData?.name || orgData?.name || '',
        phone: workspaceData?.phone || '',
        email: workspaceData?.email || '',
        logoUrl: orgData?.logo || null,
        logo: orgData?.logo || null,
        logoPreview: null,
        logoId: null,
        description: orgData?.description || '',
        domain: orgData?.website || '',
      });

      if (orgData?.logo) {
        localStorage.setItem("companyLogo", orgData.logo);
      }

      console.log('✅ اطلاعات با موفقیت بارگذاری شد');

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

  const workspaceMutation = useMutation<WorkspaceMutationResult, Error>({
    mutationFn: async (): Promise<WorkspaceMutationResult> => {
      const { accessToken, contextToken } = getTokens();
      if (!accessToken) throw new Error('توکن معتبر یافت نشد');

      const workspaceName = companyInfo.name || 'workspace';
      const slug = generateSlug(workspaceName);
      const code = slug;

      let result;
      
      if (workspaceId) {
        console.log('🔄 به‌روزرسانی workspace با ID:', workspaceId);
        console.log('📤 داده‌های ارسالی به workspace:', {
          name: workspaceName,
          phone: companyInfo.phone || '',
          email: companyInfo.email || '',
          slug,
        });
        
        result = await updateWorkspace(
          {
            name: workspaceName,
            phone: companyInfo.phone || '',
            email: companyInfo.email || '',
            slug,
          },
          accessToken,
          contextToken
        );
        console.log('✅ به‌روزرسانی workspace موفق:', result);
      } else {
        console.log('🚀 ساخت workspace جدید...');
        result = await createWorkspace(
          {
            name: workspaceName,
            phone: companyInfo.phone || '',
            email: companyInfo.email || '',
            slug,
            code,
          },
          accessToken,
          contextToken
        );
        console.log('✅ ساخت workspace موفق:', result);
      }

      return { success: true, data: result };
    },
    onSuccess: (result) => {
      const data = result.data;
      if (data) {
        const workspace = Array.isArray(data) ? data[0] : data;
        if (workspace) {
          setWorkspaceData(workspace);
          setWorkspaceId(String(workspace.id));
          saveWorkspaceToStorage(workspace);
          console.log('💾 workspace ذخیره شد:', workspace);
        }
      }
    },
    onError: (error) => {
      console.error('❌ خطا در عملیات workspace:', error);
    },
  });

  const handleSaveAll = async (): Promise<void> => {
    setIsSaving(true);
    try {
      console.log('🔄 شروع فرآیند ذخیره‌سازی...');
      console.log('🔍 اطلاعات شرکت:', {
        name: companyInfo.name,
        phone: companyInfo.phone,
        email: companyInfo.email,
        description: companyInfo.description,
        domain: companyInfo.domain,
        hasLogo: isLogoValid(companyInfo.logo as File | null),
        workspaceId: workspaceId,
      });
      
      // 1. ساخت/به‌روزرسانی workspace
      console.log('📌 مرحله 1: عملیات workspace');
      await workspaceMutation.mutateAsync();
      
      // 2. به‌روزرسانی organization
      console.log('📌 مرحله 2: به‌روزرسانی organization');
      
      const currentOrganization = localStorage.getItem('currentOrganization');
      if (currentOrganization) {
        const organization = JSON.parse(currentOrganization);
        const workspaceName = companyInfo.name || 'workspace';
        const slug = generateSlug(workspaceName);
        
        let logoUrl = organization.logo || '';
        let logoUploadSuccess = false;
        
        // ✅ آپلود لوگو (اگر وجود داشته باشد)
        const logoFile = companyInfo.logo as File | null;
        if (isLogoValid(logoFile)) {
          try {
            console.log('🔄 آپلود لوگو...');
            const { accessToken, contextToken } = getTokens();
            
            if (!accessToken) {
              console.error('❌ accessToken موجود نیست!');
              throw new Error('توکن معتبر یافت نشد');
            }
            
            console.log('🔑 توکن موجود است:', accessToken.substring(0, 30) + '...');
            console.log('🔑 contextToken:', contextToken ? contextToken.substring(0, 30) + '...' : '❌ وجود ندارد');
            
            const uploadResult = await uploadLogo(logoFile, accessToken, contextToken);
            console.log('✅ آپلود لوگو موفق:', uploadResult);
            
            localStorage.setItem("companyLogoId", uploadResult.id);
            
            const fileResult = await getLogoUrl(uploadResult.id, accessToken, contextToken);
            console.log('✅ دریافت URL لوگو:', fileResult);
            
            logoUrl = fileResult.url;
            logoUploadSuccess = true;
            
            localStorage.setItem("companyLogo", logoUrl);
            localStorage.setItem("companyLogoTimestamp", String(Date.now()));
            
            setCompanyInfo({
              ...companyInfo,
              logoUrl: logoUrl,
              logo: logoUrl,
            });
            
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('companyUpdated'));
              window.dispatchEvent(new CustomEvent('logoUpdated', { 
                detail: { 
                  logoId: uploadResult.id, 
                  logoUrl: logoUrl 
                }
              }));
            }
          } catch (uploadError) {
            console.error('❌ خطا در آپلود لوگو:', uploadError);
            console.warn('⚠️ آپلود لوگو با خطا مواجه شد، ادامه با لوگوی قبلی...');
            // اگر آپلود لوگو با خطا مواجه شد، لوگوی قبلی را نگه می‌داریم
            logoUrl = organization.logo || '';
          }
        } else {
          console.log('ℹ️ لوگویی برای آپلود وجود ندارد');
        }
        
        // ✅ ساخت payload برای organization (حتی اگر لوگو آپلود نشده باشد)
        const updatePayload: OrganizationPayload = {
          name: organization.name || workspaceName,
          legalName: organization.legalName || workspaceName,
          slug: organization.slug || slug,
          type: organization.type || 'cafe',
          legalType: organization.legalType || 'individual',
          nationalId: organization.nationalId || '',
          taxId: organization.taxId || '',
          website: companyInfo.domain || organization.website || '',
          description: companyInfo.description || organization.description || '',
          currency: organization.currency || 'IRR',
          locale: organization.locale || 'fa-IR',
          logo: logoUrl || organization.logo || '',
        };
        
        console.log('🔄 به‌روزرسانی organization با داده‌های کامل...');
        console.log('📤 ارسال به organization:', updatePayload);
        
        const { accessToken, contextToken } = getTokens();
        if (accessToken) {
          const updateResult = await updateOrganization(updatePayload, accessToken, contextToken);
          console.log('✅ به‌روزرسانی organization موفق:', updateResult);
          
          if (updateResult && Array.isArray(updateResult) && updateResult.length > 0) {
            const updatedOrg = updateResult[0];
            localStorage.setItem('currentOrganization', JSON.stringify(updatedOrg));
            console.log('✅ currentOrganization به‌روزرسانی شد');
          }
        } else {
          console.error('❌ accessToken برای به‌روزرسانی organization موجود نیست!');
        }
      }
      
      // 3. به‌روزرسانی کش
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
      
      // 4. ذخیره اطلاعات در localStorage
      localStorage.setItem("companyName", (companyInfo.name ?? '').toString());
      
      if (companyInfo.description) {
        localStorage.setItem("companyDescription", (companyInfo.description ?? '').toString());
      }
      
      if (companyInfo.domain) {
        localStorage.setItem("companyDomain", (companyInfo.domain ?? '').toString());
      }
      
      localStorage.setItem("companyPhone", (companyInfo.phone ?? '').toString());
      localStorage.setItem("companyEmail", (companyInfo.email ?? '').toString());
      
      console.log('✅ همه عملیات با موفقیت انجام شد!');
      
    } catch (error) {
      console.error('❌ خطا در ذخیره‌سازی:', error);
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
    isWorkspaceLoading: workspaceMutation.isPending,
    isLogoLoading: false,
  };
}