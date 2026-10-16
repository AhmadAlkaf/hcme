import type { MetadataRoute } from 'next';
import { BRAND } from '@/config/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.nameAr,
    short_name: BRAND.shortName,
    description:
      'وكلاء معتمدون لأكبر العلامات التجارية العالمية — منتجات وحلول كهربائية وأنظمة طاقة شمسية في المكلا وحضرموت.',
    start_url: '/ar',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#12827a',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    ],
  };
}
