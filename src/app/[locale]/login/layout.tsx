import type { Metadata } from 'next';

// Login is an authenticated entry point; it should never appear in search.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
