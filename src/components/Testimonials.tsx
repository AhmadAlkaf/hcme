'use client';


import type { ApiCustomerReview } from '@/types/api';
import { getImageUrl } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import SectionHeader from '@/components/ui/SectionHeader';
import TestimonialCard, { TestimonialItem } from '@/components/common/TestimonialCard';

interface TestimonialsProps {
  reviews?: ApiCustomerReview[];
}

export default function Testimonials({ reviews }: TestimonialsProps) {
  const tSections = useTranslations('Sections');
  const tTestimonials = useTranslations('Testimonials');
  const locale = useLocale();

  const safeReviews = Array.isArray(reviews) ? reviews : [];

  const displayTestimonials: TestimonialItem[] = safeReviews.length > 0
    ? safeReviews.map((review) => ({
        id: review.id.toString(),
        rating: 5,
        text: locale === 'ar' ? review.review_ar : (review.review_en || review.review_ar),
        name: locale === 'ar' ? review.name_ar : (review.name_en || review.name_ar),
        role: locale === 'ar' ? 'عميل' : 'Customer',
        company: '',
        image: getImageUrl(review.image)
      }))
    : [];

  return (
    <section className="py-24 bg-background relative" id="testimonials">
      <div className="container mx-auto px-6 max-w-7xl">
        <SectionHeader
          badge={`💬 ${tSections('testimonials')}`}
          titlePart1={tTestimonials('title')}
          subtitle={tTestimonials('subtitle')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
