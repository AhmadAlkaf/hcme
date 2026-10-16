import type { MetadataRoute } from 'next';
import { LOCALES, SITE_URL } from '@/config/seo';
import { serverFetchAll } from '@/lib/server-api';
import type { ApiProduct, ApiProject } from '@/types/api';

/**
 * Sitemaps change slowly (only when the catalogue does), so the whole document
 * is regenerated hourly rather than on every crawl.
 */
export const revalidate = 3600;

const STATIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '', priority: 1, changeFrequency: 'daily' },
  { path: 'products', priority: 0.9, changeFrequency: 'daily' },
  { path: 'projects', priority: 0.8, changeFrequency: 'weekly' },
];

/**
 * Builds one entry per locale for a path, each carrying the full hreflang map so
 * Google can connect the Arabic and English versions of a page.
 */
function localizedEntries(
  path: string,
  options: {
    lastModified: Date;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  }
): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = `${SITE_URL}/${locale}${path ? `/${path}` : ''}`;
  }
  languages['x-default'] = languages.ar;

  return LOCALES.map((locale) => ({
    url: languages[locale],
    lastModified: options.lastModified,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    alternates: { languages },
  }));
}

async function safeFetchAll<T>(endpoint: string): Promise<T[]> {
  try {
    const res = await serverFetchAll<T>(endpoint, { next: { revalidate } });
    return res.success ? res.items : [];
  } catch (error) {
    console.error(`Sitemap: failed to fetch ${endpoint}`, error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const item of STATIC_PATHS) {
    entries.push(
      ...localizedEntries(item.path, {
        lastModified: now,
        priority: item.priority,
        changeFrequency: item.changeFrequency,
      })
    );
  }

  const [products, projects] = await Promise.all([
    safeFetchAll<ApiProduct>('/products/product/'),
    safeFetchAll<ApiProject>('/gallery/project/'),
  ]);

  for (const product of products) {
    entries.push(
      ...localizedEntries(`products/${product.id}`, {
        lastModified: now,
        priority: 0.6,
        changeFrequency: 'weekly',
      })
    );
  }

  for (const project of projects) {
    entries.push(
      ...localizedEntries(`projects/${project.id}`, {
        lastModified: now,
        priority: 0.5,
        changeFrequency: 'monthly',
      })
    );
  }

  return entries;
}
