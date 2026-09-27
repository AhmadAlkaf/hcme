'use client';


import type { ApiBranch } from '@/types/api';
import { getImageUrl } from '@/lib/utils';
import type { Branch } from '@/types';
import { useTranslations, useLocale } from 'next-intl';
import SectionHeader from '@/components/ui/SectionHeader';
import BranchCard from '@/components/common/BranchCard';

interface BranchesProps {
  branches?: ApiBranch[];
}

export default function Branches({ branches }: BranchesProps) {
  const tSections = useTranslations('Sections');
  const tBranches = useTranslations('Branches');
  const locale = useLocale();

  const safeBranches = Array.isArray(branches) ? branches : [];

  const displayBranches: (Branch & { imageUrl?: string })[] = safeBranches.length > 0
    ? safeBranches.map((b) => ({
        id: b.id.toString(),
        name: locale === 'ar' ? b.name_ar : (b.name_en || b.name_ar),
        address: locale === 'ar' ? b.address_ar : (b.address_en || b.address_ar),
        phone: b.phone,
        email: b.email,
        workingHours:
          locale === 'ar'
            ? 'من السبت إلى الخميس: 8 صباحاً - 9 مساءً'
            : 'Sat to Thu: 8 AM - 9 PM',
        image: '🏢',
        imageUrl: getImageUrl(b.images),
        mapUrl: b.link_location
      }))
    : [];

  return (
    <section className="py-24 bg-secondary relative" id="branches">
      <div className="container mx-auto px-6 max-w-7xl">
        <SectionHeader
          badge={`📍 ${tSections('our_branches')}`}
          titlePart1={tBranches('title_part1')}
          titlePart2={tBranches('title_part2')}
          subtitle={tBranches('subtitle')}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayBranches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
      </div>
    </section>
  );
}
