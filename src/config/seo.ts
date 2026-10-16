import type { Metadata } from 'next';

/**
 * Single source of truth for everything search engines read.
 *
 * Brand strings used to be copy-pasted across the layout, the messages files
 * and several components, which made a rename risky and left no place to add
 * SEO fields. Keeping them here means the layout and every page can share the
 * same name, description and keyword lists.
 */

/** Canonical origin, without a trailing slash. Overridable per environment. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://hmecelctric.com'
).replace(/\/+$/, '');

export const BRAND = {
  shortName: 'HMEC',
  nameAr: 'مركز حضرموت الحديث للكهربائيات',
  nameEn: 'Hadramout Modern Center for Electricals',
  /** Shorter form used where the full name would be too long for a title. */
  shortNameAr: 'مركز حضرموت الحديث',
  shortNameEn: 'Hadramout Modern Center',
} as const;

export const CONTACT = {
  phone: '+967 5 000 000',
  email: 'info@hmec.ye',
  addressAr: 'شارع الستين، المكلا، حضرموت، اليمن',
  addressEn: 'Sixty Street, Mukalla, Hadramout, Yemen',
  cityAr: 'المكلا',
  cityEn: 'Mukalla',
  regionAr: 'حضرموت',
  regionEn: 'Hadramout',
  countryAr: 'اليمن',
  countryEn: 'Yemen',
} as const;

/** Filled from the API at request time when the content record provides them. */
export const SOCIAL_FALLBACK = {
  facebook: '',
  instagram: '',
  tiktok: '',
  whatsapp: '',
} as const;

export const LOCALES = ['ar', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ar';

/** Authorized brands. Used for keywords and structured data. */
export const AGENCY_BRANDS = [
  { ar: 'شنايدر إلكتريك', en: 'Schneider Electric' },
  { ar: 'إيه بي بي', en: 'ABB' },
  { ar: 'لوغراند', en: 'Legrand' },
  { ar: 'فيليبس', en: 'Philips' },
  { ar: 'سيمنز', en: 'Siemens' },
] as const;

/**
 * Keyword sets.
 *
 * Google has ignored the `keywords` meta tag for years, so these do not move
 * rankings on their own. They are kept because they are explicitly wanted, and
 * because other crawlers and internal search tools still read them. The real
 * ranking levers are the title, description, structured data and sitemap.
 */
const KEYWORDS_AR = [
  'مركز حضرموت الحديث للكهربائيات',
  'مركز حضرموت الحديث',
  'HMEC',
  'كهربائيات',
  'أدوات كهربائية',
  'مستلزمات كهربائية',
  'وكلاء معتمدون',
  'شنايدر إلكتريك',
  'إيه بي بي',
  'لوغراند',
  'فيليبس',
  'سيمنز',
  'طاقة شمسية',
  'ألواح شمسية',
  'إنارة',
  'إضاءة LED',
  'قواطع كهربائية',
  'كابلات كهربائية',
  'أسلاك كهربائية',
  'لوحات توزيع',
  'مولدات كهربائية',
  'محولات',
  'مقاولات كهربائية',
  'صيانة كهربائية',
  'تمديدات كهربائية',
  'حلول الطاقة',
  'أنظمة كهربائية',
  'المكلا',
  'حضرموت',
  'سيئون',
  'الشحر',
  'اليمن',
];

const KEYWORDS_EN = [
  'Hadramout Modern Center for Electricals',
  'Hadramout Modern Center',
  'HMEC',
  'electrical supplies',
  'electrical products',
  'authorized distributor',
  'Schneider Electric',
  'ABB',
  'Legrand',
  'Philips',
  'Siemens',
  'solar energy',
  'solar panels',
  'LED lighting',
  'circuit breakers',
  'electrical cables',
  'electrical wires',
  'distribution boards',
  'generators',
  'transformers',
  'electrical contracting',
  'electrical maintenance',
  'power solutions',
  'electrical systems',
  'Mukalla',
  'Hadramout',
  'Seiyun',
  'Ash Shihr',
  'Yemen',
];

export interface SeoCopy {
  /** Document title shown in the tab and in search results. */
  title: string;
  description: string;
  keywords: string[];
}

/** Brand name for a locale, with the short form used in titles. */
export function brandName(locale: string, short = false): string {
  const isAr = locale === 'ar';
  if (short) return isAr ? BRAND.shortNameAr : BRAND.shortNameEn;
  return isAr ? BRAND.nameAr : BRAND.nameEn;
}

/**
 * Locale-aware SEO copy for a page, with any page-specific keywords merged in
 * ahead of the shared ones so the more specific terms win.
 */
export function getSeoCopy(locale: string, extraKeywords: string[] = []): SeoCopy {
  const isAr = locale === 'ar';
  const base = isAr ? KEYWORDS_AR : KEYWORDS_EN;
  const seen = new Set<string>();
  const keywords = [...extraKeywords, ...base].filter((keyword) => {
    const key = keyword.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (isAr) {
    return {
      title: `${BRAND.nameAr} | وكلاء معتمدون لأكبر العلامات التجارية`,
      description:
        'مركز حضرموت الحديث للكهربائيات (HMEC) — وكلاء معتمدون لأكبر العلامات التجارية العالمية. منتجات وحلول كهربائية وأنظمة طاقة شمسية مع دعم فني متخصص في المكلا وحضرموت، اليمن.',
      keywords,
    };
  }

  return {
    title: `${BRAND.nameEn} | Authorized Distributor of Leading Brands`,
    description:
      'Hadramout Modern Center for Electricals (HMEC) — authorized distributor for the world’s leading brands. Electrical products, solar energy systems and specialized technical support in Mukalla, Hadramout, Yemen.',
    keywords,
  };
}

/** Canonical URL for a locale-relative path, e.g. `/products` → `/ar/products`. */
export function localizedUrl(locale: string, path = ''): string {
  const clean = path.replace(/^\/+/, '');
  return `${SITE_URL}/${locale}${clean ? `/${clean}` : ''}`;
}

/**
 * Absolute URL of the pre-rendered social preview image for a locale.
 *
 * These are static PNGs (1200×630) generated from the brand mark with the
 * Cairo font, because the runtime OG image generator cannot shape Arabic
 * without shipping a font. Shipping the rendered PNG keeps Arabic correct.
 */
export function ogImage(locale: string): string {
  return `${SITE_URL}/og-image-${locale === 'en' ? 'en' : 'ar'}.png`;
}

/**
 * Builds the shared metadata (canonical, hreflang, OpenGraph, Twitter) for a
 * page. `path` is the locale-relative path without the locale prefix.
 */
export function buildMetadata(options: {
  locale: string;
  path?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  /** Template applied to child pages' titles, e.g. `%s | Brand`. */
  titleTemplate?: string;
  /** Set for private pages so they are dropped from the index. */
  noindex?: boolean;
}): Metadata {
  const { locale, path = '', title, description, keywords, titleTemplate, noindex } = options;
  const copy = getSeoCopy(locale, keywords);
  const resolvedTitle = title || copy.title;
  const resolvedDescription = description || copy.description;
  const canonical = localizedUrl(locale, path);

  return {
    metadataBase: new URL(SITE_URL),
    title: titleTemplate ? { default: resolvedTitle, template: titleTemplate } : resolvedTitle,
    description: resolvedDescription,
    keywords: copy.keywords,
    alternates: {
      canonical,
      languages: {
        ar: localizedUrl('ar', path),
        en: localizedUrl('en', path),
        'x-default': localizedUrl(DEFAULT_LOCALE, path),
      },
    },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: brandName(locale),
      locale: locale === 'ar' ? 'ar_YE' : 'en_US',
      title: resolvedTitle,
      description: resolvedDescription,
      images: [
        {
          url: ogImage(locale),
          width: 1200,
          height: 630,
          alt: brandName(locale),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      images: [ogImage(locale)],
    },
    ...(noindex
      ? { robots: { index: false, follow: false } }
      : { robots: { index: true, follow: true } }),
  };
}
