// components/dashboard/RoleGuard.tsx
"use client";

import { ReactNode } from "react";
import { useRoleStore } from "@/stores/useRoleStore";
import NotFound from "./NotFound";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ("مدیر کل" | "مدیر" | "کارمند")[];
  fallback?: ReactNode;
}

export default function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { role } = useRoleStore();

  if (!allowedRoles.includes(role)) {
    return fallback || <NotFound />;
  }

  return <>{children}</>;
}