import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // دریافت نقش از کوکی (حالا مقدار انگلیسی است)
  const userRole = request.cookies.get("userRole")?.value;
  const isLoggedIn = request.cookies.get("isLoggedIn")?.value === "true";
  const hasSeenOnboarding = request.cookies.get("hasSeenOnboarding")?.value === "true";
  
  // مسير onboarding - اجازه دسترسي
  if (pathname === "/onboarding") {
    if (hasSeenOnboarding || !isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }
  
  // مسير success - اجازه دسترسي بدون بررسي
  if (pathname === "/onboarding/success") {
    return NextResponse.next();
  }

  // اگر در مسير onboarding نيست ولي مدير كل است و onboarding را نديده
  if (userRole === "super_admin" && !hasSeenOnboarding && isLoggedIn && 
      pathname !== "/onboarding" && pathname !== "/onboarding/success") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // اگر لاگين نيست و به مسير داشبورد ميخواهد برود
  if (!isLoggedIn && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // تعريف مسيرهاي مجاز براي هر نقش
  const adminOnlyPaths = ["/dashboard/departments", "/dashboard/settings"];
  const managerOnlyPaths = ["/dashboard/reports"];
  
  // بررسي دسترسي مدير كل (super_admin)
  if (adminOnlyPaths.some(path => pathname.startsWith(path))) {
    if (userRole !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard/unauthorized", request.url));
    }
  }

  // بررسي دسترسي مدير (manager و super_admin)
  if (managerOnlyPaths.some(path => pathname.startsWith(path))) {
    if (userRole !== "super_admin" && userRole !== "manager") {
      return NextResponse.redirect(new URL("/dashboard/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding", "/onboarding/success", "/onboarding/workspace"],
};