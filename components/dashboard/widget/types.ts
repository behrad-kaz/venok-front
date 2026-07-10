// components/dashboard/widget/types.ts

export type WidgetTabType = "status" | "appearance" | "form" | "preview";

// ===== تایپ‌های مربوط به API =====

export interface Department {
  id: number;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
}

export interface WidgetConfig {
  organizationId: number;
  workspaceId: number;
  widgetToken: string;
  companyName: string;
  logoUrl: string | null;
  primaryColor: string;
  buttonPosition: "bottom-right" | "bottom-left";
  buttonSize: "sm" | "md" | "lg";
  formTitle: string;
  formDescription: string;
  phonePlaceholder: string;
  submitButtonText: string;
  successMessage: string;
  privacyText: string;
  showDepartmentSelect: boolean;
  showDescriptionField: boolean;
  descriptionRequired: boolean;
  allowedDomains: string[];
  isActive: boolean;
  departments: Department[];
  supportTeamIds?: number[];
}

// ===== تایپ‌های فرم =====

export interface WidgetFormData {
  companyName: string;
  logoUrl: string | null;
  primaryColor: string;
  buttonPosition: "bottom-right" | "bottom-left";
  buttonSize: "sm" | "md" | "lg";
  formTitle: string;
  formDescription: string;
  phonePlaceholder: string;
  submitButtonText: string;
  successMessage: string;
  privacyText: string;
  showDepartmentSelect: boolean;
  showDescriptionField: boolean;
  descriptionRequired: boolean;
  isActive: boolean;
  allowedDomains: string[];
  supportTeamIds: number[];
}

// ===== تایپ‌های پیش‌نمایش (کپی از پروژه دوم) =====

export interface PreviewConfig {
  primaryColor: string;
  companyName: string;
  logoUrl: string | null;
  formTitle: string;
  formDescription: string;
  phonePlaceholder: string;
  submitButtonText: string;
  privacyText: string;
  showDepartmentSelect: boolean;
  showDescriptionField: boolean;
  descriptionRequired: boolean;
  buttonPosition: "bottom-right" | "bottom-left";
  buttonSize: "sm" | "md" | "lg";
  departments: Department[];
}