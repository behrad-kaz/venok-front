// components/dashboard/widget/types.ts

export type WidgetTabType = "status" | "appearance" | "form" | "referrer" | "preview";

export interface WidgetStatus {
  isActive: boolean;
  domain: string;
  lastRequest: string;
  todayRequests: number;
  totalConversations: number;
  lastCheck: string;
}

export interface WidgetAppearance {
  primaryColor: string;
  position: "bottom-right" | "bottom-left";
  buttonStyle: "circle" | "capsule";
  buttonSize: "small" | "medium" | "large";
  buttonText: string;
  showLogo: boolean;
  showChatIcon: boolean;
}