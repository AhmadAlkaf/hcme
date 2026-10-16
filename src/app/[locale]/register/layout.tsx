import type { Metadata } from 'next';

// Registration is an authenticated entry point; it should never appear in search.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
