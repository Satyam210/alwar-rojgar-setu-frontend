import { api } from './client';
import type { Testimonial, TestimonialInput } from './types';

/** GET /testimonials — public, no auth */
export async function getPublicTestimonials(): Promise<Testimonial[]> {
  const { data } = await api.get<Testimonial[]>('/testimonials');
  return data;
}

/** GET /testimonials/admin — admin only, all (published + draft) */
export async function adminGetTestimonials(): Promise<Testimonial[]> {
  const { data } = await api.get<Testimonial[]>('/testimonials/admin');
  return data;
}

/** POST /testimonials/admin */
export async function adminCreateTestimonial(input: TestimonialInput): Promise<Testimonial> {
  const { data } = await api.post<Testimonial>('/testimonials/admin', input);
  return data;
}

/** PATCH /testimonials/admin/:id */
export async function adminUpdateTestimonial(
  id: string,
  input: Partial<TestimonialInput>,
): Promise<Testimonial> {
  const { data } = await api.patch<Testimonial>(`/testimonials/admin/${id}`, input);
  return data;
}

/** DELETE /testimonials/admin/:id */
export async function adminDeleteTestimonial(id: string): Promise<void> {
  await api.delete(`/testimonials/admin/${id}`);
}
