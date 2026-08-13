// components/dashboard/admin/DepartmentsTable.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { memo } from "react";
import { api } from "@/services/api-client";

interface Department {
  id: number;
  name: string;
  openConversations: number;
  activeMembers: number;
  avgResponseTime: string;
  status: "busy" | "normal";
}

function DepartmentsTableComponent() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // محاسبه میانگین زمان پاسخ برای یک دپارتمان
  const calculateAvgResponseTime = useCallback((conversations: any[]) => {
    if (conversations.length === 0) {
      return "۰ دقیقه";
    }

    let totalResponseTime = 0;
    let responseCount = 0;

    conversations.forEach((conv: any) => {
      const messages = conv.messages || [];
      
      const customerMessages = messages.filter(
        (msg: any) => msg.senderType === "customer"
      );
      
      const agentMessages = messages.filter(
        (msg: any) =>
          msg.senderType === "agent" ||
          msg.senderType === "support" ||
          msg.senderType === "admin"
      );

      customerMessages.forEach((customerMsg: any) => {
        const customerTime = new Date(customerMsg.createdAt).getTime();
        
        const firstAgentResponse = agentMessages.find(
          (agentMsg: any) =>
            new Date(agentMsg.createdAt).getTime() > customerTime
        );

        if (firstAgentResponse) {
          const responseTime =
            new Date(firstAgentResponse.createdAt).getTime() - customerTime;
          totalResponseTime += responseTime;
          responseCount++;
        }
      });
    });

    if (responseCount === 0) {
      return "۰ دقیقه";
    }

    const avgMs = totalResponseTime / responseCount;
    const avgMinutes = Math.round(avgMs / 60000);

    if (avgMinutes < 1) {
      return "کمتر از ۱ دقیقه";
    }

    return `${avgMinutes} دقیقه`;
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoading(true);
        
        // 1️⃣ دریافت دپارتمان‌ها (تیم‌های پشتیبانی)
        const teamsResponse = await api.get<any[]>("/support/team");
        const teams = Array.isArray(teamsResponse) ? teamsResponse : [];
        console.log("📋 تیم‌های دریافت شده:", teams);

        // 2️⃣ دریافت همه گفتگوها
        const conversationsResponse = await api.get<{ data: any[] }>("/conversation");
        const conversations = conversationsResponse?.data || [];
        console.log("💬 تعداد گفتگوها:", conversations.length);

        // 3️⃣ دریافت همه Staffها
        const staffResponse = await api.get<any[]>("/staff");
        // بررسی ساختار پاسخ - ممکن است data داشته باشد یا خودش آرایه باشد
        let staffs: any[] = [];
        if (Array.isArray(staffResponse)) {
          staffs = staffResponse;
        } else if (staffResponse?.data && Array.isArray(staffResponse.data)) {
          staffs = staffResponse.data;
        } else {
          console.warn("⚠️ ساختار پاسخ Staff نامشخص است:", staffResponse);
          staffs = [];
        }
        console.log("👥 Staffهای دریافت شده:", staffs);
        console.log("👥 جزئیات Staffها:", JSON.stringify(staffs, null, 2));

        // 4️⃣ دریافت Staffها به روش دیگر (از طریق /staff/me یا /staff?limit=100)
        // اگر staffs خالی بود، با limit بیشتر تلاش کن
        if (staffs.length === 0) {
          try {
            const staffResponse2 = await api.get<any[]>("/staff?limit=100");
            if (Array.isArray(staffResponse2)) {
              staffs = staffResponse2;
            } else if (staffResponse2?.data && Array.isArray(staffResponse2.data)) {
              staffs = staffResponse2.data;
            }
            console.log("👥 Staffهای دریافت شده (تلاش دوم):", staffs);
          } catch (error) {
            console.warn("⚠️ تلاش دوم برای دریافت Staffها ناموفق بود:", error);
          }
        }

        // 5️⃣ اگر هنوز staffs خالی است، از localStorage یا داده‌های موجود استفاده کن
        if (staffs.length === 0) {
          console.warn("⚠️ هیچ Staffی دریافت نشد، بررسی localStorage...");
          // ممکن است Staffها در localStorage ذخیره شده باشند
          // یا ممکن است کاربر جدید باشد و هنوز Staff ایجاد نشده
        }

        const mapped: Department[] = teams
          .filter((team: any) => team.deletedAt === null)
          .map((team: any) => {
            const teamId = team.id;

            // ✅ 1. گفتگوهای باز اختصاص یافته به این دپارتمان
            const openConversations = conversations.filter(
              (conv: any) =>
                conv.teamId === teamId &&
                conv.status !== "closed" &&
                conv.deletedAt === null
            ).length;

            // ✅ 2. اعضای فعال این دپارتمان
            // بررسی دقیق ساختار Staff
            const departmentStaffs = staffs.filter((staff: any) => {
              // بررسی اینکه staff دارای departmentId باشد و با teamId برابر باشد
              const hasDepartment = staff.departmentId === teamId;
              const isNotDeleted = staff.deletedAt === null || staff.deletedAt === undefined;
              const isActive = staff.isActive !== false; // اگر undefined باشد، true در نظر گرفته می‌شود
              
              console.log(`🔍 بررسی Staff ${staff.id} (${staff.name}): departmentId=${staff.departmentId}, teamId=${teamId}, match=${hasDepartment}, isActive=${isActive}`);
              
              return hasDepartment && isNotDeleted && isActive;
            });

            const activeMembers = departmentStaffs.length;
            console.log(`📊 دپارتمان ${team.name} (ID: ${teamId}): ${activeMembers} عضو فعال`);

            // ✅ 3. میانگین زمان پاسخ
            const teamConversations = conversations.filter(
              (conv: any) =>
                conv.teamId === teamId &&
                conv.status !== "closed" &&
                conv.deletedAt === null
            );

            const avgResponseTime = calculateAvgResponseTime(teamConversations);

            // ✅ 4. وضعیت دپارتمان
            const status: Department["status"] =
              activeMembers > 0 && openConversations / activeMembers > 1
                ? "busy"
                : "normal";

            return {
              id: teamId,
              name: team.name,
              openConversations,
              activeMembers,
              avgResponseTime,
              status,
            };
          });

        console.log("✅ دپارتمان‌های نهایی:", mapped);
        setDepartments(mapped);
      } catch (error) {
        console.error("❌ خطا در دریافت دپارتمان‌ها:", error);
        setDepartments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, [calculateAvgResponseTime]);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] overflow-hidden">
        <div className="p-5 border-b border-[rgba(255,255,255,0.1)]">
          <h3 className="text-sm font-bold text-white">وضعیت دپارتمان‌ها</h3>
        </div>
        <div className="p-5">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-[rgba(255,255,255,0.03)] rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] overflow-hidden">
        <div className="p-5 border-b border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">وضعیت دپارتمان‌ها</h3>
            <Link
              href="/dashboard/departments"
              className="text-xs text-gray-500 hover:text-[#59D8C3] transition-colors"
            >
              مشاهده همه
            </Link>
          </div>
        </div>
        <div className="p-5 text-center">
          <p className="text-gray-400 text-sm">هیچ دپارتمانی یافت نشد</p>
          <p className="text-gray-500 text-xs mt-1">برای ایجاد دپارتمان به بخش دپارتمان‌ها بروید</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] overflow-hidden">
      <div className="p-5 border-b border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">وضعیت دپارتمان‌ها</h3>
          <Link
            href="/dashboard/departments"
            className="text-xs text-gray-500 hover:text-[#59D8C3] transition-colors"
          >
            مشاهده همه
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-[rgba(255,255,255,0.1)]">
            <tr>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">دپارتمان</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">گفتگوهای باز</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">اعضای فعال</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">میانگین پاسخ</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">وضعیت</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, index) => (
              <motion.tr
                key={dept.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="border-b border-[rgba(255,255,255,0.05)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
              >
                <td className="px-4 py-3.5">
                  <span className="text-sm font-medium text-white">{dept.name}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-white">{dept.openConversations}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5BE0A8]" />
                    <span className="text-sm text-white">{dept.activeMembers}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-gray-500">{dept.avgResponseTime}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      dept.status === "busy"
                        ? "text-[#F2B84B] bg-[rgba(242,184,75,0.1)] border-[rgba(242,184,75,0.2)]"
                        : "text-[#5BE0A8] bg-[rgba(91,224,168,0.1)] border-[rgba(91,224,168,0.2)]"
                    }`}
                  >
                    {dept.status === "busy" ? "شلوغ" : "عادی"}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <Link
                    href={`/dashboard/conversations?departmentId=${dept.id}`}
                    className="text-xs text-[#59D8C3] hover:text-[#6ef3dc] font-medium transition-colors"
                  >
                    مشاهده گفتگوها
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ✅ استفاده از memo برای جلوگیری از رندر مجدد
export default memo(DepartmentsTableComponent);