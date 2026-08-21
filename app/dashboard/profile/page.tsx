"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { authService } from "@/services/auth.service";
import { api } from "@/services/api-client";
import { User, Mail, Phone, Building2, Shield, MessageCircle, Clock, TrendingUp, Camera } from "lucide-react";
import Modal from "@/components/ui/modal/Modal";

interface ProfileData {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  departmentName: string;
  departmentColor: string;
  status: string;
  lastOnlineAt: string | null;
  createdAt: string;
  avatar: string | null;
  stats: {
    totalConversations: number;
    answeredConversations: number;
    avgResponseTime: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUserId = () => {
    const userId = localStorage.getItem("userId");
    return userId ? Number(userId) : null;
  };

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const staffId = authService.getStaffId();
      
      if (!staffId) {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          router.push("/login");
          return;
        }

        const userName = localStorage.getItem("userName") || "کاربر";
        const firstName = localStorage.getItem("firstName") || "";
        const lastName = localStorage.getItem("lastName") || "";
        const userPhone = localStorage.getItem("userPhone") || "";
        const userEmail = localStorage.getItem("userEmail") || localStorage.getItem("supportEmail") || "";
        const userRole = localStorage.getItem("userRole") || "کاربر";
        const userDepartment = localStorage.getItem("userDepartment") || "";
        const userId = getUserId();

        const fullName = `${firstName} ${lastName}`.trim() || userName;

        let conversations: any[] = [];
        try {
          const conversationsResponse = await api.get<{ data: any[] }>("/conversation");
          conversations = conversationsResponse?.data || [];
        } catch (convErr) {
          console.error("❌ خطا در دریافت گفتگوها:", convErr);
        }

        const staffConversations = conversations.filter(
          (conv: any) => conv.status === "answered" || conv.status === "closed"
        );

        const answered = staffConversations.length;

        let totalResponseTime = 0;
        let responseCount = 0;

        staffConversations.forEach((conv: any) => {
          const messages = conv.messages || [];
          const sortedMessages = [...messages].sort(
            (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          let lastCustomerTime = 0;
          let firstAgentAfterCustomer = false;

          for (const msg of sortedMessages) {
            if (msg.senderType === "customer") {
              lastCustomerTime = new Date(msg.createdAt).getTime();
              firstAgentAfterCustomer = false;
            } else if (
              (msg.senderType === "agent" || msg.senderType === "support" || msg.senderType === "admin") &&
              lastCustomerTime > 0 &&
              !firstAgentAfterCustomer
            ) {
              const agentTime = new Date(msg.createdAt).getTime();
              if (agentTime > lastCustomerTime) {
                totalResponseTime += agentTime - lastCustomerTime;
                responseCount++;
                firstAgentAfterCustomer = true;
              }
            }
          }
        });

        const avgMs = responseCount > 0 ? totalResponseTime / responseCount : 0;
        const avgMinutes = Math.round(avgMs / 60000);
        const avgResponseTime = avgMinutes < 1 ? "کمتر از ۱ دقیقه" : `${avgMinutes} دقیقه`;

        setProfile({
          id: userId || Date.now(),
          name: fullName,
          phone: userPhone,
          email: userEmail || null,
          role: userRole === "مدیر کل" ? "admin" : userRole === "مدیر" ? "department_manager" : "staff",
          departmentName: userDepartment || "بدون دپارتمان",
          departmentColor: "#59D8C3",
          status: "active",
          lastOnlineAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          avatar: null,
          stats: {
            totalConversations: conversations.length,
            answeredConversations: answered,
            avgResponseTime,
          },
        });
        return;
      }

      let staffData: any = null;
      let staffError: string | null = null;

      try {
        staffData = await api.get(`/staff/${staffId}`);
      } catch (err) {
        console.error("❌ خطا در دریافت اطلاعات کارمند:", err);
        staffError = err instanceof Error ? err.message : "خطا در دریافت اطلاعات کارمند";
      }

      if (!staffData) {
        throw new Error(staffError || "اطلاعات کارمند یافت نشد");
      }

      let conversations: any[] = [];
      try {
        const conversationsResponse = await api.get<{ data: any[] }>("/conversation");
        conversations = conversationsResponse?.data || [];
      } catch (convErr) {
        console.error("❌ خطا در دریافت گفتگوها:", convErr);
      }

      const staffIdNum = staffData.id;
      
      const staffConversations = conversations.filter(
        (conv: any) => conv.agentId === staffIdNum || conv.agent?.id === staffIdNum
      );

      const answered = staffConversations.filter(
        (conv: any) => conv.status === "answered" || conv.status === "closed"
      ).length;

      let totalResponseTime = 0;
      let responseCount = 0;

      staffConversations.forEach((conv: any) => {
        const messages = conv.messages || [];
        const sortedMessages = [...messages].sort(
          (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        let lastCustomerTime = 0;
        let firstAgentAfterCustomer = false;

        for (const msg of sortedMessages) {
          if (msg.senderType === "customer") {
            lastCustomerTime = new Date(msg.createdAt).getTime();
            firstAgentAfterCustomer = false;
          } else if (
            (msg.senderType === "agent" || msg.senderType === "support" || msg.senderType === "admin") &&
            lastCustomerTime > 0 &&
            !firstAgentAfterCustomer
          ) {
            const agentTime = new Date(msg.createdAt).getTime();
            if (agentTime > lastCustomerTime) {
              totalResponseTime += agentTime - lastCustomerTime;
              responseCount++;
              firstAgentAfterCustomer = true;
            }
          }
        }
      });

      const avgMs = responseCount > 0 ? totalResponseTime / responseCount : 0;
      const avgMinutes = Math.round(avgMs / 60000);
      const avgResponseTime = avgMinutes < 1 ? "کمتر از ۱ دقیقه" : `${avgMinutes} دقیقه`;

      setProfile({
        id: staffData.id,
        name: staffData.name,
        phone: staffData.phone || "",
        email: staffData.email,
        role: staffData.role || "staff",
        departmentName: staffData.department?.name || "بدون دپارتمان",
        departmentColor: staffData.department?.color || "#59D8C3",
        status: staffData.status || "active",
        lastOnlineAt: staffData.lastOnlineAt,
        createdAt: staffData.createdAt,
        avatar: staffData.avatar || null,
        stats: {
          totalConversations: staffConversations.length,
          answeredConversations: answered,
          avgResponseTime,
        },
      });
    } catch (err) {
      console.error("❌ خطا در دریافت اطلاعات پروفایل:", err);
      setError(err instanceof Error ? err.message : "خطا در بارگذاری اطلاعات پروفایل");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");

      const uploadResponse = await api.post<{ success: boolean; filePath: string; filename: string; folder: string }>("/upload/file", formData);
      
      console.log("📤 پاسخ آپلود:", uploadResponse);
      
      const avatarPath = uploadResponse?.filePath;

      if (!avatarPath || typeof avatarPath !== "string") {
        throw new Error("آپلود فایل موفقیت‌آمیز نبود. پاسخ سرور: " + JSON.stringify(uploadResponse));
      }

      const userId = getUserId();
      if (!userId) {
        throw new Error("شناسه کاربر یافت نشد");
      }

      const nameParts = (profile?.name || "").split(" ");
      const firstName = localStorage.getItem("firstName") || nameParts[0] || "";
      const lastName = localStorage.getItem("lastName") || nameParts.slice(1).join(" ") || "کاربر";

      await api.put(`/users/${userId}`, {
        avatar: avatarPath,
      });

      setProfile(prev => prev ? { ...prev, avatar: avatarPath } : null);
      
      setShowSuccessModal(true);
    } catch (err) {
      console.error("❌ خطا در آپلود عکس:", err);
      setError(err instanceof Error ? err.message : "خطا در آپلود عکس پروفایل");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case "admin":
        return "مدیر کل";
      case "department_manager":
        return "مدیر دپارتمان";
      case "staff":
        return "کارمند";
      default:
        return role;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "active":
        return "فعال";
      case "inactive":
        return "غیرفعال";
      case "suspended":
        return "تعلیق شده";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "نامشخص";
    const date = new Date(dateString);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAvatarUrl = (avatar: string | null, name: string, color: string) => {
    if (avatar) {
      if (avatar.startsWith("http")) return avatar;
      if (avatar.startsWith("/")) return avatar;
      return `/${avatar}`;
    }
    return `https://ui-avatars.com/api/?background=${color.replace("#", "")}&color=06110F&name=${encodeURIComponent(name)}&length=2&font-size=0.24&size=96`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] animate-pulse">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-[rgba(255,255,255,0.05)]" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-[rgba(255,255,255,0.05)] rounded w-1/3" />
                <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{error || "خطا در بارگذاری اطلاعات پروفایل"}</p>
          <button 
            onClick={fetchProfile} 
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[rgba(89,216,195,0.1)] text-[#59D8C3] border border-[rgba(89,216,195,0.2)] hover:bg-[rgba(89,216,195,0.2)] transition-all"
          >
            تلاش مجدد
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* هدر پروفایل */}
        <div className="p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={getAvatarUrl(profile.avatar, profile.name, profile.departmentColor)}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#59D8C3]/30"
              />
              <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-[#0D1B17] ${
                profile.status === "active" ? "bg-[#5BE0A8]" : "bg-gray-500"
              }`} />
              <button
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-[#59D8C3] hover:bg-[#4bc4b0] text-[#06110F] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                title="تغییر عکس پروفایل"
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-[#06110F] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">{profile.name}</h1>
              <p className="text-sm text-[#59D8C3] mb-2">{getRoleLabel(profile.role)}</p>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border" style={{
                  backgroundColor: `${profile.departmentColor}15`,
                  color: profile.departmentColor,
                  borderColor: `${profile.departmentColor}40`,
                }}>
                  <Building2 className="w-3 h-3" />
                  {profile.departmentName}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                  profile.status === "active"
                    ? "bg-[rgba(91,224,168,0.12)] text-[#5be0a8] border-[rgba(91,224,168,0.28)]"
                    : "bg-[rgba(111,136,128,0.12)] text-gray-400 border-[rgba(111,136,128,0.22)]"
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${profile.status === "active" ? "bg-[#5be0a8]" : "bg-gray-500"}`} />
                  {getStatusLabel(profile.status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* اطلاعات تماس */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[rgba(89,216,195,0.08)] border border-[rgba(89,216,195,0.15)] flex items-center justify-center">
                <Phone className="w-5 h-5 text-[#59D8C3]" />
              </div>
              <h3 className="text-sm font-medium text-white">شماره تماس</h3>
            </div>
            <p className="text-lg font-bold text-white mr-[52px]">{profile.phone || "ثبت نشده"}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[rgba(89,216,195,0.08)] border border-[rgba(89,216,195,0.15)] flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#59D8C3]" />
              </div>
              <h3 className="text-sm font-medium text-white">ایمیل</h3>
            </div>
            <p className="text-lg font-bold text-white mr-[52px]">{profile.email || "ثبت نشده"}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[rgba(89,216,195,0.08)] border border-[rgba(89,216,195,0.15)] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#59D8C3]" />
              </div>
              <h3 className="text-sm font-medium text-white">نقش</h3>
            </div>
            <p className="text-lg font-bold text-white mr-[52px]">{getRoleLabel(profile.role)}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[rgba(89,216,195,0.08)] border border-[rgba(89,216,195,0.15)] flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#59D8C3]" />
              </div>
              <h3 className="text-sm font-medium text-white">تاریخ عضویت</h3>
            </div>
            <p className="text-lg font-bold text-white mr-[52px]">{formatDate(profile.createdAt)}</p>
          </div>
        </div>

        {/* آمار عملکرد */}
        <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
          <h3 className="text-base font-bold text-white mb-6">آمار عملکرد</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-[rgba(89,216,195,0.05)] border border-[rgba(89,216,195,0.1)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[rgba(89,216,195,0.1)] border border-[rgba(89,216,195,0.2)] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[#59D8C3]" />
                </div>
                <p className="text-sm text-gray-500">کل گفتگوها</p>
              </div>
              <p className="text-3xl font-bold text-white">{profile.stats.totalConversations}</p>
            </div>

            <div className="p-5 rounded-xl bg-[rgba(91,224,168,0.05)] border border-[rgba(91,224,168,0.1)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[rgba(91,224,168,0.1)] border border-[rgba(91,224,168,0.2)] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#5BE0A8]" />
                </div>
                <p className="text-sm text-gray-500">پاسخ‌داده‌شده</p>
              </div>
              <p className="text-3xl font-bold text-white">{profile.stats.answeredConversations}</p>
            </div>

            <div className="p-5 rounded-xl bg-[rgba(242,184,75,0.05)] border border-[rgba(242,184,75,0.1)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[rgba(242,184,75,0.1)] border border-[rgba(242,184,75,0.2)] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#F2B84B]" />
                </div>
                <p className="text-sm text-gray-500">میانگین زمان پاسخ</p>
              </div>
              <p className="text-3xl font-bold text-white">{profile.stats.avgResponseTime}</p>
            </div>
          </div>
        </div>

        {/* اطلاعات حساب */}
        <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
          <h3 className="text-base font-bold text-white mb-6">اطلاعات حساب</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">نام کامل</span>
              </div>
              <span className="text-sm text-white font-medium">{profile.name}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">نقش</span>
              </div>
              <span className="text-sm text-white font-medium">{getRoleLabel(profile.role)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">دپارتمان</span>
              </div>
              <span className="text-sm text-white font-medium">{profile.departmentName}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">آخرین فعالیت</span>
              </div>
              <span className="text-sm text-white font-medium">
                {profile.lastOnlineAt ? formatDate(profile.lastOnlineAt) : "نامشخص"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="عکس پروفایل به‌روزرسانی شد"
        message="عکس پروفایل شما با موفقیت تغییر کرد."
        variant="success"
        confirmButton={{
          label: "باشه",
          onClick: () => setShowSuccessModal(false),
        }}
      />
    </DashboardLayout>
  );
}
