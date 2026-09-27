'use server';

import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/lib/server-api';

function extractErrorMessage(data: any, fallbackMessage: string): string {
  if (data && data.errors && typeof data.errors === 'object' && Object.keys(data.errors).length > 0) {
    const firstErrorKey = Object.keys(data.errors)[0];
    const firstError = data.errors[firstErrorKey];
    if (firstError) {
      return Array.isArray(firstError) ? firstError[0] : firstError;
    }
  }
  return data?.message || fallbackMessage;
}

export async function loginUser(credentials: { email?: string; username?: string; password?: string }) {
  try {
    const baseUrl = getApiBaseUrl();
    const endpoint = baseUrl.endsWith('/') ? `${baseUrl}user/login/` : `${baseUrl}/user/login/`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: extractErrorMessage(data, 'فشل تسجيل الدخول، يرجى التحقق من البيانات'),
        errors: data.errors || null,
      };
    }

    const token = data.data?.token;

    if (token) {
      // Save the token in a cookie
      const cookieStore = await cookies();
      cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
      });

      // Save user info for UI
      if (data.data.user) {
        cookieStore.set('user_info', JSON.stringify(data.data.user), {
          httpOnly: false, // Accessible by client if needed, or just server
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
          sameSite: 'lax',
        });
      }

      return {
        success: true,
        data: data.data,
      };
    }

    return {
      success: false,
      error: 'استجابة غير صحيحة من الخادم (التوكن مفقود)',
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'حدث خطأ في الاتصال بالخادم',
    };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  cookieStore.delete('access_token');
  cookieStore.delete('token');
  cookieStore.delete('user_info');
}

export async function registerUser(userData: {
  username?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  password?: string;
  password2?: string;
}) {
  try {
    const baseUrl = getApiBaseUrl();
    const endpoint = baseUrl.endsWith('/') ? `${baseUrl}user/register/` : `${baseUrl}/user/register/`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: extractErrorMessage(data, 'فشل التسجيل، يرجى التحقق من البيانات'),
        errors: data.errors || null,
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'حدث خطأ في الاتصال بالخادم',
    };
  }
}
