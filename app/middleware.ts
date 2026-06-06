// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // دریافت نقش از کوکی
  const userRole = request.cookies.get("userRole")?.value;
  const isLoggedIn = request.cookies.get("isLoggedIn")?.value === "true";
  const hasSeenOnboarding = request.cookies.get("hasSeenOnboarding")?.value === "true";
  
  // مسیر onboarding - اجازه دسترسی
  if (pathname === "/onboarding") {
    // اگر قبلاً onboarding را دیده یا لاگین نیست، ریدایرکت به لاگین
    if (hasSeenOnboarding || !isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }
  
  // مسیر success - اجازه دسترسی بدون بررسی
  if (pathname === "/onboarding/success") {
    return NextResponse.next();
  }

  // اگر در مسیر onboarding نیست ولی مدیر کل است و onboarding را ندیده
  if (userRole === "مدیر کل" && !hasSeenOnboarding && isLoggedIn && 
      pathname !== "/onboarding" && pathname !== "/onboarding/success") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // اگر لاگین نیست و به مسیر داشبورد می‌خواهد برود
  if (!isLoggedIn && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // تعریف مسیرهای مجاز برای هر نقش
  const adminOnlyPaths = ["/dashboard/departments", "/dashboard/settings"];
  const managerOnlyPaths = ["/dashboard/reports"];
  
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
   matcher: ["/dashboard/:path*", "/onboarding", "/onboarding/success", "/onboarding/workspace"],
};