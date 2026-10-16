import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/seo';

/**
 * Dashboard, the API routes and every authenticated page are excluded from the
 * index. Without this the admin login screen and order pages could show up in
 * search results.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/api/',
          '/*/login',
          '/*/register',
          '/*/orders',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
