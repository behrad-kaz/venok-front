// stores/useOnboardingStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WorkspaceData {
  id: number;
  name: string;
  slug: string;
  code: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  postalCode?: string;
  locale?: string;
}

export interface CompanyInfo {
  name: string;
  phone: string;
  email: string;
  logo: File | string | null;  // ✅ تغییر به File | string | null
  logoPreview: string | null;
  logoUrl: string | null;      // ✅ اضافه شد
  logoId: string | null;      // ✅ اضافه شد
  description?: string;
  domain?: string;
}

interface OnboardingState {
  // اطلاعات شرکت
  companyInfo: CompanyInfo;
  workspaceData: WorkspaceData | null;
  workspaceId: string | null;
  
  // وضعیت‌ها
  isSaving: boolean;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  uploadError: string | null;
  
  // Actions
  setCompanyInfo: (info: Partial<CompanyInfo>) => void;
  setWorkspaceData: (data: WorkspaceData | null) => void;
  setWorkspaceId: (id: string | null) => void;
  setIsSaving: (isSaving: boolean) => void;
  setUploadStatus: (status: 'idle' | 'uploading' | 'success' | 'error') => void;
  setUploadError: (error: string | null) => void;
  reset: () => void;
}

const initialCompanyInfo: CompanyInfo = {
  name: '',
  phone: '',
  email: '',
  logo: null,
  logoPreview: null,
  logoUrl: null,
  logoId: null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      companyInfo: initialCompanyInfo,
      workspaceData: null,
      workspaceId: null,
      isSaving: false,
      uploadStatus: 'idle',
      uploadError: null,

      setCompanyInfo: (info) =>
        set((state) => ({
          companyInfo: { ...state.companyInfo, ...info },
        })),

      setWorkspaceData: (data) => set({ workspaceData: data }),
      
      setWorkspaceId: (id) => set({ workspaceId: id }),
      
      setIsSaving: (isSaving) => set({ isSaving }),
      
      setUploadStatus: (status) => set({ uploadStatus: status }),
      
      setUploadError: (error) => set({ uploadError: error }),
      
      reset: () =>
        set({
          companyInfo: initialCompanyInfo,
          workspaceData: null,
          workspaceId: null,
          isSaving: false,
          uploadStatus: 'idle',
          uploadError: null,
        }),
    }),
    {
      name: 'onboarding-storage',
      partialize: (state) => ({
        companyInfo: {
          name: state.companyInfo.name,
          phone: state.companyInfo.phone,
          email: state.companyInfo.email,
          logoUrl: state.companyInfo.logoUrl,
          logoId: state.companyInfo.logoId,
        },
        workspaceId: state.workspaceId,
      }),
    }
  )
);