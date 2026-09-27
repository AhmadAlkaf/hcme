'use client';

interface SectionHeaderProps {
  badge?: string;
  titlePart1: string;
  titlePart2?: string;
  subtitle?: string;
  className?: string;
  dark?: boolean;
}

export default function SectionHeader({
  badge,
  titlePart1,
  titlePart2,
  subtitle,
  className = '',
  dark = false
}: SectionHeaderProps) {
  return (
    <div className={`text-center max-w-3xl mx-auto mb-16 ${className}`}>
      {badge && (
        <div
          className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm mb-4 border shadow-xs ${
            dark
              ? 'bg-white/10 text-primary-light border-white/5'
              : 'bg-primary-subtle text-primary border-primary/10'
          }`}
        >
          {badge}
        </div>
      )}

      <h2
        className={`text-3xl md:text-5xl font-black leading-tight mb-4 ${
          dark ? 'text-white' : 'text-slate-900'
        }`}
      >
        {titlePart1}{' '}
        {titlePart2 && (
          <span className={dark ? 'text-primary-light' : 'text-primary'}>
            {titlePart2}
          </span>
        )}
      </h2>

      {subtitle && (
        <p
          className={`text-lg font-medium leading-relaxed ${
            dark ? 'text-white/70' : 'text-slate-600'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
