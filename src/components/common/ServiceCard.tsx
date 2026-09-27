'use client';

import type { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(27,166,156,0.3)] backdrop-blur-sm flex flex-col">
      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-transform duration-300">
        {service.icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
      <p className="text-white/60 leading-relaxed flex-grow mb-6">
        {service.description}
      </p>

      {service.features && service.features.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-white/10">
          {service.features.map((feature, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white/80"
            >
              {feature}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
