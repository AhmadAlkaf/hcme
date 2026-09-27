import { ApiResponse } from '@/types/api';
import { getApiBaseUrl } from './server-api';

export async function getSiteData(): Promise<ApiResponse | null> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(baseUrl, {
      // Use Incremental Static Regeneration to validate data every hour (3600 seconds)
      // or you can use next: { revalidate: 60 } for 1 minute
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error('Failed to fetch data', res.statusText);
      return null;
    }

    const data: ApiResponse = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching site data:', error);
    return null;
  }
}
