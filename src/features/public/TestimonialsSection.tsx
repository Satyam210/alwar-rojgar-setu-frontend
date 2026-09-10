import { useTranslation } from 'react-i18next';
import { usePublicTestimonials } from './queries';
import type { Testimonial } from '@/api/types';

export function TestimonialsSection() {
  const { t } = useTranslation('common');
  const { data: testimonials } = usePublicTestimonials();

  if (!testimonials || testimonials.length === 0) return null;

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <TestimonialCard key={t.id} testimonial={t} />
        ))}
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex flex-col gap-4 rounded-xl border border-border bg-white p-5 shadow-sm">
      <blockquote className="flex-1 text-sm leading-relaxed text-content">
        <span aria-hidden="true" className="text-brand-300 text-2xl leading-none select-none">"</span>
        {testimonial.body}
        <span aria-hidden="true" className="text-brand-300 text-2xl leading-none select-none">"</span>
      </blockquote>
      <figcaption className="flex items-center gap-3">
        {testimonial.photoUrl ? (
          <img
            src={testimonial.photoUrl}
            alt=""
            aria-hidden="true"
            className="h-10 w-10 rounded-full object-cover bg-brand-50"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold text-sm"
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
