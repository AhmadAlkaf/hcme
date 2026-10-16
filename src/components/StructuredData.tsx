import { BRAND, CONTACT, SITE_URL, brandName, getSeoCopy, ogImage } from '@/config/seo';
import type { ApiData } from '@/types/api';

/**
 * Renders schema.org structured data for the public site.
 *
 * Search engines use this to build rich results (business name, address, phone,
 * brands) and to understand that every branch belongs to one organization. The
 * content comes from the same API the page renders, so it never drifts from what
 * visitors see.
 */
export default function StructuredData({
  data,
  locale,
}: {
  data?: ApiData;
  locale: string;
}) {
  const isAr = locale === 'ar';
  const content = data?.content;
  const orgId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;

  const social = [content?.facebook, content?.instagram, content?.toktek, content?.whatsapp].filter(
    (value): value is string => Boolean(value && value.trim())
  );

  const brandList = (data?.our_agent ?? [])
    .map((agent) => (isAr ? agent.name_ar : agent.name_en) || agent.name_ar)
    .filter(Boolean);

  const graph: Record<string, unknown>[] = [
    {
      '@type': ['Organization', 'ElectricalSupplyStore'],
      '@id': orgId,
      name: brandName(locale),
      alternateName: [BRAND.nameAr, BRAND.nameEn, BRAND.shortName],
      url: `${SITE_URL}/${locale}`,
      logo: `${SITE_URL}/icon.png`,
      image: ogImage(locale),
      description: getSeoCopy(locale).description,
      email: content?.email || CONTACT.email,
      telephone: CONTACT.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: isAr ? CONTACT.addressAr : CONTACT.addressEn,
        addressLocality: isAr ? CONTACT.cityAr : CONTACT.cityEn,
        addressRegion: isAr ? CONTACT.regionAr : CONTACT.regionEn,
        addressCountry: 'YE',
      },
      areaServed: [
        { '@type': 'City', name: isAr ? CONTACT.cityAr : CONTACT.cityEn },
        { '@type': 'AdministrativeArea', name: isAr ? CONTACT.regionAr : CONTACT.regionEn },
        { '@type': 'Country', name: isAr ? CONTACT.countryAr : CONTACT.countryEn },
      ],
      ...(social.length ? { sameAs: social } : {}),
      ...(brandList.length
        ? { brand: brandList.map((name) => ({ '@type': 'Brand', name })) }
        : {}),
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: `${SITE_URL}/${locale}`,
      name: brandName(locale),
      inLanguage: locale,
      publisher: { '@id': orgId },
    },
  ];

  for (const branch of data?.branch ?? []) {
    const name = (isAr ? branch.name_ar : branch.name_en) || branch.name_ar;
    const node: Record<string, unknown> = {
      '@type': 'LocalBusiness',
      name,
      parentOrganization: { '@id': orgId },
      address: {
        '@type': 'PostalAddress',
        streetAddress: (isAr ? branch.address_ar : branch.address_en) || branch.address_ar,
        addressLocality: isAr ? CONTACT.cityAr : CONTACT.cityEn,
        addressRegion: isAr ? CONTACT.regionAr : CONTACT.regionEn,
        addressCountry: 'YE',
      },
    };
    if (branch.phone) node.telephone = branch.phone;
    if (branch.email) node.email = branch.email;
    if (branch.link_location) node.hasMap = branch.link_location;
    graph.push(node);
  }

  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });

  return (
    <script
      type="application/ld+json"
      // Escaping `<` prevents any content value from closing the script tag.
      dangerouslySetInnerHTML={{ __html: json.replace(/</g, '\\u003c') }}
    />
  );
}
