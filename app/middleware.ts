// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // دریافت نقش از کوکی یا localStorage (در middleware نمی‌توان به localStorage دسترسی داشت)
  // برای این کار بهتر است از cookies استفاده کنید
  const userRole = request.cookies.get("userRole")?.value || "کارمند";

  // تعریف مسیرهای مجاز برای هر نقش
  const adminOnlyPaths = ["/dashboard/departments", "/dashboard/settings"];
  const managerOnlyPaths = ["/dashboard/reports"];
  const staffOnlyPaths: string[] = [];

  // بررسی دسترسی مدیر کل
  if (adminOnlyPaths.some(path => pathname.startsWith(path))) {
    if (userRole !== "مدیر کل") {
      return NextResponse.redirect(new URL("/dashboard/unauthorized", request.url));
    }
  }

  // بررسی دسترسی مدیر
  if (managerOnlyPaths.some(path => pathname.startsWith(path))) {
    if (userRole !== "مدیر کل" && userRole !== "مدیر") {
      return NextResponse.redirect(new URL("/dashboard/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/dashboard/:path*",
};