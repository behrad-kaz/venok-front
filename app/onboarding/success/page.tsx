"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { authService } from "@/services/auth.service";

export default function OnboardingSuccessPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

      if (!isLoggedIn) {
        router.replace("/login");
        return;
      }

      // سازمان و workspaceهای واقعی از API خوانده می‌شوند
      const { hasWorkspace } = await authService.hydrateContext();

      // کاربری که هنوز workspace ندارد باید onboarding را طی کند
      const redirectPath = hasWorkspace ? "/dashboard" : "/onboarding/workspace";

      setIsProcessing(false);
      router.replace(redirectPath);
    };

    const timer = setTimeout(run, 500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#062723] to-[#020504] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-[#59D8C3] flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-12 h-12 text-[#06110F]" />
        </motion.div>
        
        <h1 className="text-3xl font-bold text-white mb-4">ورود موفقیت‌آمیز!</h1>
        <p className="text-gray-400 mb-8">در حال انتقال به داشبورد...</p>
        
        {isProcessing && (
          <div className="w-8 h-8 border-2 border-[#59D8C3] border-t-transparent rounded-full animate-spin mx-auto" />
        )}
      </motion.div>
    </div>
  );
}