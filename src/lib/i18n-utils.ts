/**
 * A utility function to extract the localized field from an API response object.
 * It will try to get the field for the active locale, and fallback to the Arabic ('ar') field if it doesn't exist.
 *
 * @param item - The object returned from the API (e.g., { name_ar: "...", name_en: "..." })
 * @param baseField - The base name of the field (e.g., "name", "our_vision")
 * @param locale - The currently active locale ("ar" or "en")
 * @returns The localized string or an empty string if not found.
 */
export function getLocalizedField(item: unknown, baseField: string, locale: string): string {
  if (!item || typeof item !== 'object') return '';

  const obj = item as Record<string, unknown>;
  const localizedKey = `${baseField}_${locale}`;
  const defaultKey = `${baseField}_ar`;

  return String(obj[localizedKey] || obj[defaultKey] || '');
}
