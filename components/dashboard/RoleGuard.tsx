"use client";

import { ReactNode, useEffect } from "react";
import { useRoleStore } from "@/stores/useRoleStore";
import NotFound from "./NotFound";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ("مدیر کل" | "مدیر" | "کارمند")[];
  fallback?: ReactNode;
}

export default function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { role, loadRoleFromStorage } = useRoleStore();

  // ✅ بارگذاری نقش از localStorage هنگام mount
  useEffect(() => {
    loadRoleFromStorage();
  }, [loadRoleFromStorage]);

  if (!allowedRoles.includes(role)) {
    return fallback || <NotFound />;
  }

  return <>{children}</>;
}