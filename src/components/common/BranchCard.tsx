'use client';

import type { Branch } from '@/types';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BranchCardProps {
  branch: Branch & { imageUrl?: string };
}

export default function BranchCard({ branch }: BranchCardProps) {
  const tCommon = useTranslations('Common');

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden group">
      {/* Header */}
      <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-4 group-hover:bg-primary-subtle/50 transition-colors">
        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl shrink-0 overflow-hidden">
          {branch.imageUrl ? (
            <img
              src={branch.imageUrl}
              alt={branch.name}
              className="w-full h-full object-cover"
            />
          ) : (
            branch.image
          )}
        </div>
        <h3 className="font-extrabold text-xl text-foreground">{branch.name}</h3>
      </div>

      {/* Details */}
      <div className="p-6 flex flex-col gap-5">
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-1">
            <MapPin size={16} />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground mb-1">
              {tCommon('address')}
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {branch.address}
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-1">
            <Phone size={16} />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground mb-1">
              {tCommon('phone')}
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed" dir="ltr">
              {branch.phone}
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-1">
            <Mail size={16} />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground mb-1">
              {tCommon('email')}
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {branch.email}
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-1">
            <Clock size={16} />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground mb-1">
              {tCommon('working_hours')}
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {branch.workingHours}
            </div>
          </div>
        </div>

        {branch.mapUrl && (
          <a
            href={branch.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 w-full py-2.5 rounded-lg border-2 border-primary-subtle text-primary font-bold text-center hover:bg-primary hover:text-white transition-colors"
          >
            {tCommon('view_on_map')}
          </a>
        )}
      </div>
    </div>
  );
}
