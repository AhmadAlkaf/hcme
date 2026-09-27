'use client';

import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const locale = useLocale();

  return (
    <nav className={`flex items-center gap-2 text-xs font-semibold flex-wrap ${className}`} aria-label="Breadcrumb">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <div key={idx} className="flex items-center gap-2">
            {idx > 0 && (
              <span className="text-white/40 select-none">
                {locale === 'ar' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
              </span>
            )}

            {isLast || !item.href ? (
              <span className="text-primary-light font-bold truncate max-w-[200px] sm:max-w-none">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-white/70 hover:text-primary-light transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
