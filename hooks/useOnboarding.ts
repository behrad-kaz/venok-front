// hooks/useOnboarding.ts
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

interface WorkspaceMutationResult {
  success: boolean;
  data?: WorkspaceData | WorkspaceData[];
}

interface LogoAndOrganizationResult {
  url: string;
  id: string;
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

  // تابع تولید slug با timestamp برای جلوگیری از تکراری شدن
  const generateSlug = (name: string): string => {
    // اگر name خالی بود، از "workspace" استفاده کن
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
    
    // اگر slug خالی شد، از "workspace" استفاده کن
    if (!slug) slug = 'workspace';
    
    // اضافه کردن timestamp برای یکتا شدن
    return `${slug}-${Date.now()}`;
  };

  // ✅ Type Guard برای بررسی وجود لوگو
  const isLogoValid = (logo: File | null): logo is File => {
    return logo !== null && logo !== undefined;
  };

  // Mutation برای ساخت/به‌روزرسانی workspace
  const workspaceMutation = useMutation<WorkspaceMutationResult, Error>({
    mutationFn: async (): Promise<WorkspaceMutationResult> => {
      const { accessToken, contextToken } = getTokens();
      if (!accessToken) throw new Error('توکن معتبر یافت نشد');

      // اگر name خالی بود، از "workspace" استفاده کن
      const workspaceName = companyInfo.name || 'workspace';
      const slug = generateSlug(workspaceName);
      const code = slug;

      let result;
      
      // اگر workspaceId وجود دارد، به‌روزرسانی کن
      if (workspaceId) {
        console.log('🔄 به‌روزرسانی workspace با ID:', workspaceId);
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
        // ساخت workspace جدید
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

  // Mutation برای آپلود لوگو و به‌روزرسانی organization
  const logoAndOrganizationMutation = useMutation<LogoAndOrganizationResult | null, Error>({
    mutationFn: async (): Promise<LogoAndOrganizationResult | null> => {
      const { accessToken, contextToken } = getTokens();
      if (!accessToken) throw new Error('توکن معتبر یافت نشد');
      
      // ✅ استفاده از Type Guard برای بررسی وجود لوگو
      if (!isLogoValid(companyInfo.logo)) {
        console.log('ℹ️ لوگویی برای آپلود وجود ندارد (companyInfo.logo is null/undefined)');
        return null;
      }

      // ✅ حالا TypeScript میدونه که companyInfo.logo از نوع File هست
      const logoFile: File = companyInfo.logo;

      setUploadStatus('uploading');

      // 1. آپلود لوگو
      console.log('🔄 آپلود لوگو...', logoFile.name, logoFile.size);
      const uploadResult = await uploadLogo(logoFile, accessToken, contextToken);
      console.log('✅ آپلود لوگو موفق:', uploadResult);
      
      // 2. دریافت URL
      console.log('🔄 دریافت URL لوگو...');
      const fileResult = await getLogoUrl(uploadResult.id, accessToken, contextToken);
      console.log('✅ دریافت URL لوگو:', fileResult);
      
      // 3. به‌روزرسانی organization
      const currentOrganization = localStorage.getItem('currentOrganization');
      if (currentOrganization) {
        const organization = JSON.parse(currentOrganization);
        const workspaceName = companyInfo.name || 'workspace';
        const slug = generateSlug(workspaceName);
        
        console.log('🔄 به‌روزرسانی organization با لوگو...');
        await updateOrganization(
          {
            name: organization.name || workspaceName,
            legalName: organization.legalName || workspaceName,
            slug: organization.slug || slug,
            type: organization.type || 'cafe',
            legalType: organization.legalType || 'individual',
            logo: fileResult.url,
            nationalId: organization.nationalId || '',
            taxId: organization.taxId || '',
            website: organization.website || '',
            currency: organization.currency || 'IRR',
            locale: organization.locale || 'fa-IR',
          },
          accessToken,
          contextToken
        );
        console.log('✅ به‌روزرسانی organization موفق');
      }

      return fileResult;
    },
    onSuccess: (data) => {
      if (data) {
        // ✅ ذخیره لوگو در store
        setCompanyInfo({
          logoUrl: data.url,
          logoId: data.id,
        });
        
        // ✅ ذخیره لوگو در localStorage برای DashboardLayout
        localStorage.setItem('companyLogo', data.url);
        
        // ✅ Dispatch رویداد برای به‌روزرسانی DashboardLayout
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('companyUpdated'));
        }
        
        setUploadStatus('success');
        setTimeout(() => setUploadStatus('idle'), 3000);
        console.log('✅ لوگو با موفقیت آپلود شد:', data.url);
      }
    },
    onError: (error: Error) => {
      console.error('❌ خطا در آپلود لوگو:', error);
      setUploadStatus('error');
      setUploadError(error.message || 'خطا در آپلود لوگو');
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadError(null);
      }, 3000);
    },
  });

  // تابع اصلی ذخیره‌سازی
  const handleSaveAll = async (): Promise<void> => {
    setIsSaving(true);
    try {
      console.log('🔄 شروع فرآیند ذخیره‌سازی...');
      console.log('🔍 وضعیت لوگو در store:', {
        hasLogo: isLogoValid(companyInfo.logo),
        logoName: companyInfo.logo?.name,
        logoSize: companyInfo.logo?.size,
        logoUrl: companyInfo.logoUrl,
        logoPreview: companyInfo.logoPreview ? 'exists' : 'null',
      });
      
      // 1. ساخت/به‌روزرسانی workspace
      console.log('📌 مرحله 1: عملیات workspace');
      await workspaceMutation.mutateAsync();
      
      // 2. آپلود لوگو و به‌روزرسانی organization
      // ✅ استفاده از Type Guard
      if (isLogoValid(companyInfo.logo)) {
        console.log('📌 مرحله 2: آپلود لوگو و به‌روزرسانی organization');
        await logoAndOrganizationMutation.mutateAsync();
      } else {
        console.log('ℹ️ لوگویی برای آپلود وجود ندارد');
      }
      
      // 3. به‌روزرسانی کش
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
      
      console.log('✅ همه عملیات با موفقیت انجام شد!');
      
    } catch (error) {
      console.error('❌ خطا در ذخیره‌سازی:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    // State
    companyInfo,
    workspaceData,
    workspaceId,
    isSaving,
    uploadStatus,
    uploadError,
    
    // Actions
    setCompanyInfo,
    handleSaveAll,
    isWorkspaceLoading: workspaceMutation.isPending,
    isLogoLoading: logoAndOrganizationMutation.isPending,
  };
}