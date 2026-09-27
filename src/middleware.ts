import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
 
const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const isDashboardRoute = req.nextUrl.pathname.includes('/dashboard');
  
  if (isDashboardRoute) {
    const token = req.cookies.get('auth_token')?.value || req.cookies.get('access_token')?.value || req.cookies.get('token')?.value;
    
    // Determine the locale from the pathname or use default
    const pathname = req.nextUrl.pathname;
    const locale = routing.locales.find(l => pathname.startsWith(`/${l}/`) || pathname === `/${l}`) || routing.defaultLocale;

    if (!token) {
      const loginUrl = new URL(`/${locale}/login`, req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Check if the user is staff (admin)
    let isStaff = false;
    try {
      const userInfoCookie = req.cookies.get('user_info')?.value;
      if (userInfoCookie) {
        const decoded = decodeURIComponent(userInfoCookie);
        const userInfo = JSON.parse(decoded);
        isStaff = userInfo && userInfo.is_staff === true;
      }
    } catch (e) {
      console.error('Failed to parse user_info cookie in middleware:', e);
    }

    if (!isStaff) {
      // Redirect non-staff users to the home page
      const homeUrl = new URL(`/${locale}`, req.url);
      return NextResponse.redirect(homeUrl);
    }
    
    // User is authenticated and is staff, allow access to unlocalized dashboard
    return NextResponse.next();
  }

  return intlMiddleware(req);
}
 
export const config = {
  // Match only internationalized pathnames, and generic paths like /dashboard that will be caught and localized
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};


// هذا الملف middleware.ts يحتوي على كود middleware مخصص لتطبيق Next.js مع دعم التدويل (i18n) وحماية مسارات لوحة التحكم (dashboard). يقوم الكود بالتحقق من وجود توكن المصادقة (auth token) في ملفات تعريف الارتباط (cookies) للمستخدم، وإذا لم يكن موجودًا، يتم إعادة توجيه المستخدم إلى صفحة تسجيل الدخول. كما يتحقق من ما إذا كان المستخدم لديه صلاحيات المسؤول (staff) قبل السماح له بالوصول إلى لوحة التحكم. إذا لم يكن المستخدم مسؤولًا، يتم إعادة توجيهه إلى الصفحة الرئيسية.

// import { NextRequest, NextResponse } from 'next/server';
// import createMiddleware from 'next-intl/middleware';
// import { routing } from './i18n/routing';

// const intlMiddleware = createMiddleware(routing);

// // دالة مساعدة لاستخراج التوكن من عدة أماكن محتملة
// function getAuthToken(req: NextRequest): string | undefined {
//   return (
//     req.cookies.get('auth_token')?.value ||
//     req.cookies.get('access_token')?.value ||
//     req.cookies.get('token')?.value
//   );
// }

// // دالة مساعدة لاستخراج user_info بشكل آمن
// function getUserInfo(req: NextRequest): any | null {
//   const cookie =
//     req.cookies.get('user_info')?.value ||
//     req.cookies.get('user')?.value;

//   if (!cookie) return null;

//   try {
//     // جرّب decodeURIComponent مرة، ثم JSON.parse
//     const decoded = decodeURIComponent(cookie);
//     return JSON.parse(decoded);
//   } catch {
//     // في حال كان مخزّناً بدون encoding
//     try {
//       return JSON.parse(cookie);
//     } catch (e) {
//       console.error('Failed to parse user_info cookie:', e);
//       return null;
//     }
//   }
// }

// // دالة لاستخراج الـ locale من المسار
// function getLocaleFromPath(pathname: string): string {
//   const found = routing.locales.find(
//     (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
//   );
//   return found || routing.defaultLocale;
// }

// export default function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // ✅ السماح بمسارات API دون تدخل
//   if (pathname.startsWith('/api')) {
//     return NextResponse.next();
//   }

//   const isDashboardRoute = pathname.includes('/dashboard');
//   const locale = getLocaleFromPath(pathname);

//   // ============================================
//   // حماية الداشبورد
//   // ============================================
//   if (isDashboardRoute) {
//     const token = getAuthToken(req);

//     // إذا لا يوجد توكن → اذهب لصفحة تسجيل الدخول
//     if (!token) {
//       const loginUrl = new URL(`/${locale}/login`, req.url);
//       // احفظ الصفحة المطلوبة للعودة إليها بعد الدخول
//       loginUrl.searchParams.set('redirect', pathname);
//       return NextResponse.redirect(loginUrl);
//     }

//     // فحص هل المستخدم staff (أدمن)
//     const userInfo = getUserInfo(req);
//     const isStaff = userInfo?.is_staff === true;

//     if (!isStaff) {
//       // مستخدم عادي → الصفحة الرئيسية
//       const homeUrl = new URL(`/${locale}`, req.url);
//       return NextResponse.redirect(homeUrl);
//     }

//     // ✅ المستخدم أدمن وموثّق → اسمح بالمرور
//     return NextResponse.next();
//   }

//   // ============================================
//   // إذا كان المستخدم مسجلاً دخول وذهب لصفحة login
//   // → وجّهه للداشبورد مباشرة
//   // ============================================
//   const isLoginPage =
//     pathname === `/${locale}/login` || pathname === `/${locale}/register`;

//   if (isLoginPage) {
//     const token = getAuthToken(req);
//     const userInfo = getUserInfo(req);
//     const isStaff = userInfo?.is_staff === true;

//     // إذا مسجل دخول وكـ staff → وجّهه للداشبورد
//     if (token && isStaff) {
//       const dashboardUrl = new URL(`/${locale}/dashboard`, req.url);
//       return NextResponse.redirect(dashboardUrl);
//     }
//   }

//   // ============================================
//   // الباقي: مرّر عبر next-intl
//   // ============================================
//   return intlMiddleware(req);
// }

// export const config = {
//   matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
// };