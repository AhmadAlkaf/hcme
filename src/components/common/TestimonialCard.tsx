'use client';

import { Star } from 'lucide-react';

export interface TestimonialItem {
  id: string;
  rating: number;
  text: string;
  name: string;
  role: string;
  company?: string;
  image?: string;
}

interface TestimonialCardProps {
  testimonial: TestimonialItem;
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={18}
        className={
          i < rating
            ? 'fill-accent text-accent'
            : 'fill-slate-200 text-slate-200'
        }
      />
    ));
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col h-full group">
      <div className="flex items-center gap-1 mb-6">
        {renderStars(testimonial.rating)}
      </div>

      <p className="text-muted-foreground leading-relaxed flex-grow mb-8 text-lg font-medium italic">
        &quot;{testimonial.text}&quot;
      </p>

      <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
        <div className="w-12 h-12 rounded-full bg-primary-subtle text-primary flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
          {testimonial.image ? (
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials(testimonial.name)
          )}
        </div>
        <div>
          <div className="font-bold text-foreground">{testimonial.name}</div>
          <div className="text-sm text-muted-foreground">
            {testimonial.role}{' '}
            {testimonial.company ? `- ${testimonial.company}` : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
