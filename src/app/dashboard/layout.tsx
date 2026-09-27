import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import '../globals.css';
import { DashboardClientShell } from '@/components/dashboard/DashboardClientShell';

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'لوحة التحكم | مركز حضرموت الحديث للكهربائيات (HMEC)',
  description: 'لوحة تحكم إدارة المحتوى المخصصة لمركز حضرموت الحديث للكهربائيات',
};

import { cookies } from 'next/headers';

export default async function DashboardServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userInfoCookie = cookieStore.get('user_info')?.value;
  let user = null;
  
  if (userInfoCookie) {
    try {
      user = JSON.parse(userInfoCookie);
    } catch (e) {
      console.error('Failed to parse user info', e);
    }
  }

  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} min-h-screen bg-background text-foreground flex flex-col dir-rtl antialiased selection:bg-primary/20`}>
        <DashboardClientShell user={user}>
          {children}
        </DashboardClientShell>
      </body>
    </html>
  );
}
