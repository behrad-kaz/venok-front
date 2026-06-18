"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

// تعریف تایپ برای خطا
interface ApiError {
  message?: string;
  status?: number;
  response?: {
    data?: {
      message?: string;
    };
  };
}

// تعریف تایپ برای پاسخ سوییچ
interface SwitchResponse {
  contextToken: string;
}

// تعریف تایپ برای پاسخ سوییچ با توکن (در صورت وجود)
interface SwitchResponseWithToken extends SwitchResponse {
  token?: {
    accessToken: string;
    refreshToken: string;
  };
}

export default function OnboardingSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasRedirected = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleRedirect = useCallback((path: string) => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;
    
    setTimeout(() => {
      router.push(path);
    }, 100);
  }, [router]);

  useEffect(() => {
    let isMounted = true;
    
    const handleSwitchAndRedirect = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const organizationsStr = localStorage.getItem("organizations");
        
        if (!accessToken) {
          throw new Error("توکن معتبر یافت نشد");
        }
        
        if (!organizationsStr) {
          throw new Error("اطلاعات سازمان یافت نشد");
        }
        
        const organizations = JSON.parse(organizationsStr);
        const defaultOrganization = organizations[0];
        const defaultWorkspace = defaultOrganization?.workspaces?.[0];
        
        const organizationId = defaultOrganization?.id;
        const workspaceId = defaultWorkspace?.id;
        
        console.log("📡 اطلاعات پیش‌فرض:", {
          organizationId,
          workspaceId,
          hasWorkspace: !!defaultWorkspace
        });
        
        let contextToken: string | null = null;
        
        // تنظیم هدر Authorization برای درخواست سوییچ
        try {
          const switchResponse = await fetch("http://localhost:3001/account/context/switch", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              actorType: "staff",
              organizationId: organizationId,
              workspaceId: workspaceId || 0
            }),
          });
          
          if (switchResponse.ok || switchResponse.status === 200 || switchResponse.status === 201) {
            const switchData = await switchResponse.json() as SwitchResponseWithToken;
            console.log("✅ سوییچ موفق:", switchData);
            
            // ذخیره contextToken
            if (switchData?.contextToken) {
              contextToken = switchData.contextToken;
              localStorage.setItem("contextToken", contextToken);
              localStorage.setItem("x-context-token", contextToken);
              
              // ذخیره در کوکی برای middleware
              const maxAge = 60 * 60 * 24 * 7;
              document.cookie = `contextToken=${contextToken}; path=/; max-age=${maxAge}`;
              document.cookie = `x-context-token=${contextToken}; path=/; max-age=${maxAge}`;
              
              console.log("✅ contextToken ذخیره شد:", contextToken);
            }
            
            // به‌روزرسانی توکن در صورت وجود
            if (switchData?.token) {
              localStorage.setItem("accessToken", switchData.token.accessToken);
              localStorage.setItem("refreshToken", switchData.token.refreshToken);
              console.log("✅ توکن به‌روزرسانی شد");
            }
          } else {
            console.warn("⚠️ سوییچ با خطا مواجه شد، اما ادامه می‌دهیم");
          }
        } catch (switchError) {
          console.warn("⚠️ خطا در سوییچ، اما ادامه می‌دهیم:", switchError);
        }
        
        localStorage.setItem("currentOrganizationId", String(organizationId));
        if (workspaceId) {
          localStorage.setItem("currentWorkspaceId", String(workspaceId));
        }
        
        let targetPath = "/dashboard";
        
        if (!defaultWorkspace) {
          targetPath = "/onboarding/workspace";
          console.log("🚀 بدون workspace → رفتن به صفحه راه‌اندازی");
        } else {
          console.log("🚀 دارای workspace → رفتن به داشبورد");
        }
        
        if (isMounted) {
          setIsProcessing(false);
          
          let count = 3;
          const updateCountdown = () => {
            if (!isMounted) return;
            setCountdown(count);
            count--;
            
            if (count < 0) {
              if (timerRef.current) clearTimeout(timerRef.current);
              handleRedirect(targetPath);
            } else {
              timerRef.current = setTimeout(updateCountdown, 1000);
            }
          };
          
          timerRef.current = setTimeout(updateCountdown, 1000);
        }
        
      } catch (err: unknown) {
        console.error("❌ خطا در پردازش:", err);
        
        let errorMessage = "خطا در پردازش درخواست";
        
        if (err && typeof err === 'object') {
          const apiError = err as ApiError;
          if (apiError.message) {
            errorMessage = apiError.message;
          } else if (apiError.response?.data?.message) {
            errorMessage = apiError.response.data.message;
          }
        } else if (typeof err === 'string') {
          errorMessage = err;
        }
        
        if (isMounted) {
          setError(errorMessage);
          setIsProcessing(false);
        }
      }
    };
    
    handleSwitchAndRedirect();
    
    return () => {
      isMounted = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [handleRedirect]);
  
  const handleBackToLogin = useCallback(() => {
    const keysToRemove = [
      "isLoggedIn", "userRole", "hasSeenOnboarding", "userRoleEnglish",
      "userName", "userToken", "refreshToken", "userId", "userPhone",
      "accessToken", "organizations", "currentOrganizationId", "currentWorkspaceId",
      "loginUsername", "loginPassword", "contextToken", "x-context-token"
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    document.cookie.split(";").forEach(cookie => {
      const [name] = cookie.split("=");
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/`;
    });
    
    router.push("/login");
  }, [router]);
  
  // نمایش خطا در صورت وجود
  if (error) {
    return (
      <main className="flex-1 overflow-y-auto rtl-scrollbar p-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#59d8c3] to-transparent" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#59d8c3] rounded-full blur-[150px]" />
        </div>
        
        <div className="min-h-screen flex items-center justify-center p-6" dir="rtl">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] shadow-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">خطا در پردازش</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            
            <button
              onClick={handleBackToLogin}
              className="mt-4 text-sm text-[#59D8C3] hover:text-[#4dc7b5] transition-colors"
            >
              بازگشت به ورود
            </button>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="flex-1 overflow-y-auto rtl-scrollbar p-6">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#59d8c3] to-transparent" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#59d8c3] rounded-full blur-[150px]" />
      </div>

      <div className="min-h-screen flex items-center justify-center p-6" dir="rtl">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] shadow-2xl text-center">
          {/* آیکون تیک موفقیت */}
          <div className="w-20 h-20 rounded-full bg-[rgba(89,216,195,0.1)] border border-[rgba(89,216,195,0.2)] flex items-center justify-center mx-auto mb-6">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#59d8c3"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">ورود موفق بود</h2>

          <p className="text-gray-400 mb-6">
            {isProcessing ? "در حال پردازش اطلاعات..." : "در حال انتقال به پنل..."}
          </p>

          <div className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <circle cx="12" cy="12" r="10" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
            </svg>
            <span className="text-sm text-gray-400">
              {isProcessing ? "در حال اتصال به سرور..." : `هدایت به پنل (${countdown})`}
            </span>
          </div>

          {!isProcessing && countdown === 0 && (
            <button
              onClick={handleBackToLogin}
              className="mt-8 text-sm text-[#59D8C3] hover:text-[#4dc7b5] transition-colors"
            >
              بازگشت به ورود
            </button>
          )}
        </div>
      </div>
    </main>
  );
}