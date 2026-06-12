// app/api/auth/user/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📤 Proxy: ارسال درخواست به سرور اصلی');
    console.log('📦 داده‌های دریافتی:', body);

    // آدرس سرور اصلی
    const API_BASE_URL = 'http://localhost:3002';
    
    const response = await fetch(`${API_BASE_URL}/api/auth/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    console.log('✅ Proxy: پاسخ دریافت شد:', data);
    
    // ارسال پاسخ به کلاینت
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در ارتباط با سرور اصلی' 
      },
      { status: 500 }
    );
  }
}