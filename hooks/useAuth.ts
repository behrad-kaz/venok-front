// hooks/useAuth.ts - نسخه ساده بدون useEffect
'use client';

import { useState, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { StoredUserData } from '@/types/auth.types';

export function useAuth() {
  // دریافت اطلاعات به صورت همزمان در زمان ساخت هوک
  const [user, setUser] = useState<Partial<StoredUserData> | null>(() => {
    if (typeof window !== 'undefined') {
      return authService.getStoredUserData();
    }
    return null;
  });

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const refreshAuth = useCallback(() => {
    const userData = authService.getStoredUserData();
    setUser(userData);
  }, []);

  const isAuthenticated = user?.isLoggedIn === true && authService.isTokenValid();
  const isLoading = false; // در این نسخه هیچ لودینگی نداریم

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    refreshAuth,
    getAccessToken: useCallback(() => authService.getAccessToken(), []),
    getOrganizations: useCallback(() => authService.getOrganizations(), []),
  };
}