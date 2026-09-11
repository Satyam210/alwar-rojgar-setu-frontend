import { useTranslation } from 'react-i18next';
import { usePublicTestimonials } from './queries';
import type { Testimonial } from '@/api/types';

export function TestimonialsSection() {
  const { t } = useTranslation('common');
  const { data: testimonials } = usePublicTestimonials();

  if (!testimonials || testimonials.length === 0) return null;

  const useCarousel = testimonials.length > 3;
  const doubled = [...testimonials, ...testimonials];

  return (
    <section aria-labelledby="testimonials-heading">
      <h2 id="testimonials-heading" className="mb-4 flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="h-7 w-1.5 rounded-full bg-gradient-to-b from-brand-500 to-brand-700"
        />
        {t('home.testimonials.title')}
      </h2>
      <p className="mb-6 text-sm text-content-muted">{t('home.testimonials.subtitle')}</p>

      {useCarousel ? (
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-accent-50 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-accent-50 to-transparent" />
          <div
            className="flex gap-4"
            style={{
              animation: `testimonial-scroll ${testimonials.length * 6}s linear infinite`,
              width: 'max-content',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = 'paused')}
            onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = 'running')}
          >
            {doubled.map((item, i) => (
              <TestimonialCard key={`${item.id}-${i}`} testimonial={item} />
            ))}
          </div>
          <style>{`
            @keyframes testimonial-scroll {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <TestimonialCard key={item.id} testimonial={item} />
          ))}
        </div>
      )}
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex w-72 shrink-0 flex-col gap-4 rounded-xl border border-border bg-white p-5 shadow-sm">
      <blockquote className="flex-1 text-sm leading-relaxed text-content">
        <span aria-hidden="true" className="select-none text-2xl leading-none text-brand-300">"</span>
        {testimonial.body}
        <span aria-hidden="true" className="select-none text-2xl leading-none text-brand-300">"</span>
      </blockquote>
      <figcaption className="flex items-center gap-3">
        {testimonial.photoUrl ? (
          <img
            src={testimonial.photoUrl}
            alt=""
            aria-hidden="true"
            className="h-10 w-10 rounded-full bg-brand-50 object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700"
          >
            {testimonial.name.charAt(0).toUpperCase()}
          </span>
        )}
        <div>
          <p className="text-sm font-semibold text-content">{testimonial.name}</p>
          {testimonial.trade && (
            <p className="text-xs text-content-muted">{testimonial.trade}</p>
          )}
        </div>
      </figcaption>
    </figure>
  );
}
