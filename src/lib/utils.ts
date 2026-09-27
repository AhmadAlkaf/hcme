import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  'https://api.hmecelctric.com'
  ;

/**
 * Ensures that an image URL is an absolute URL pointing to the backend
 * if it is a relative path returned by the API.
 */
export function getImageUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
}
