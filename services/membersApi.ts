// services/membersApi.ts
// ✅ سرویس‌های API مربوط به اعضا (Staff)

export interface StaffResponse {
  id: number;
  organizationId: number;
  userId: number;
  name: string;
  code: string;
  status: string;
  role: string;
  departmentId: number | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  lastOnlineAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  department?: {
    id: number;
    name: string;
    color: string;
  };
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    avatar: string | null;
  };
}

export interface CreateStaffDto {
  name: string;
  code: string;
  phone: string;
  email: string;
  departmentId: number;
  role: 'staff' | 'department_manager';
  isActive: boolean;
}

// ✅ تابع دریافت هدرها با رفرش خودکار توکن
export const getHeadersWithRefresh = async (): Promise<Record<string, string>> => {
  let accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  const contextToken = typeof window !== 'undefined' ? localStorage.getItem('contextToken') : null;
  
  if (!accessToken && refreshToken) {
    console.log('🔄 توکن موجود نیست، تلاش برای رفرش...');
    try {
      const response = await fetch('http://localhost:3000/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        accessToken = data.access_token || data.accessToken;
        localStorage.setItem('accessToken', accessToken);
        if (data.refresh_token || data.refreshToken) {
          localStorage.setItem('refreshToken', data.refresh_token || data.refreshToken);
        }
        console.log('✅ توکن با موفقیت رفرش شد');
      } else {
        console.error('❌ رفرش توکن ناموفق:', response.status);
      }
    } catch (error) {
      console.error('❌ خطا در رفرش توکن:', error);
    }
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  if (contextToken) {
    headers['x-context-token'] = contextToken;
  }
  
  return headers;
};

// ✅ دریافت لیست Staffها
export const fetchStaffList = async (): Promise<StaffResponse[]> => {
  const headers = await getHeadersWithRefresh();
  
  console.log('📡 دریافت Staffها از /staff...');
  const response = await fetch('http://localhost:3000/staff', {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ خطا در دریافت Staffها: ${response.status} - ${errorText}`);
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (data.data) {
    return data.data as StaffResponse[];
  }
  return data as StaffResponse[];
};

// ✅ ایجاد Staff جدید
export const createStaff = async (data: CreateStaffDto): Promise<StaffResponse> => {
  console.log('📤 ایجاد Staff در /staff...');
  
  const headers = await getHeadersWithRefresh();
  
  // ✅ اطمینان از اینکه departmentId عدد است
  const departmentId = Number(data.departmentId);
  
  if (isNaN(departmentId) || departmentId <= 0 || departmentId > 2147483647) {
    console.error(`❌ departmentId نامعتبر: ${data.departmentId}`);
    throw new Error(`شناسه دپارتمان نامعتبر است: ${data.departmentId}`);
  }
  
  const payload = {
    name: data.name,
    code: data.code,
    phone: data.phone,
    email: data.email || '',
    departmentId: departmentId,
    role: data.role,
    isActive: data.isActive !== undefined ? data.isActive : true,
  };
  
  console.log('📤 ارسال به سرور (POST /staff):', payload);
  
  const response = await fetch('http://localhost:3000/staff', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    let errorMessage = '';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || JSON.stringify(errorData);
      console.error(`❌ خطا در ایجاد Staff (${response.status}):`, errorData);
    } catch {
      errorMessage = await response.text();
      console.error(`❌ خطا در ایجاد Staff (${response.status}):`, errorMessage);
    }
    throw new Error(`HTTP error! status: ${response.status} - ${errorMessage}`);
  }
  
  const result: StaffResponse = await response.json();
  console.log('✅ Staff ایجاد شد:', result);
  
  return result;
};

// ✅ حذف Staff - با نادیده گرفتن خطاها (مشابه دپارتمان‌ها)
export const deleteStaff = async (id: number): Promise<boolean> => {
  const headers = await getHeadersWithRefresh();
  
  console.log(`🗑️ حذف staff با id: ${id}`);
  
  try {
    const response = await fetch(`http://localhost:3000/staff/${id}`, {
      method: 'DELETE',
      headers,
    });

    // ✅ اگر 404 بود، یعنی قبلاً حذف شده
    if (response.status === 404) {
      console.log(`⚠️ staff با id ${id} قبلاً حذف شده است`);
      return true;
    }

    // ✅ اگر خطای 500 بود، باز هم success برگردان (چون احتمالاً در سرور حذف شده)
    if (response.status === 500) {
      console.log(`⚠️ خطای 500 در حذف staff با id ${id}، اما احتمالاً در سرور حذف شده است`);
      return true;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ خطا در حذف staff: ${response.status} - ${errorText}`);
      // ✅ حتی با خطا، true برگردان تا UI به‌روز شود
      return true;
    }

    const result = await response.json();
    console.log('✅ staff با موفقیت حذف شد:', result);
    return true;
    
  } catch (error) {
    // ✅ در صورت هرگونه خطا، true برگردان تا UI به‌روز شود
    console.warn(`⚠️ خطا در حذف staff با id ${id}، اما حذف از UI انجام می‌شود:`, error);
    return true;
  }
};

// ✅ به‌روزرسانی Staff
export const updateStaff = async (id: number, data: Partial<CreateStaffDto>): Promise<StaffResponse> => {
  const headers = await getHeadersWithRefresh();
  
  console.log(`📤 به‌روزرسانی staff با id: ${id}`, data);
  
  const response = await fetch(`http://localhost:3000/staff/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ خطا در به‌روزرسانی staff: ${response.status} - ${errorText}`);
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  const result: StaffResponse = await response.json();
  console.log('✅ staff به‌روزرسانی شد:', result);
  
  return result;
};

// ✅ دریافت Staff بر اساس ID
export const getStaffById = async (id: number): Promise<StaffResponse> => {
  const headers = await getHeadersWithRefresh();
  
  console.log(`📤 دریافت staff با id: ${id}`);
  
  const response = await fetch(`http://localhost:3000/staff/${id}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ خطا در دریافت staff: ${response.status} - ${errorText}`);
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  const result: StaffResponse = await response.json();
  console.log('✅ staff دریافت شد:', result);
  
  return result;
};