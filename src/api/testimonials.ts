import { api } from './client';
import type { Testimonial, TestimonialInput, CandidateTestimonialInput } from './types';

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

/** PATCH /testimonials/admin/:id — only isPublished and displayOrder allowed */
export async function adminUpdateTestimonial(
  id: string,
  input: { isPublished?: boolean; displayOrder?: number },
): Promise<Testimonial> {
  const { data } = await api.patch<Testimonial>(`/testimonials/admin/${id}`, input);
  return data;
}

/** DELETE /testimonials/admin/:id */
export async function adminDeleteTestimonial(id: string): Promise<void> {
  await api.delete(`/testimonials/admin/${id}`);
}

/** POST /testimonials/candidate — candidate submits own testimonial */
export async function candidateSubmitTestimonial(input: CandidateTestimonialInput): Promise<Testimonial> {
  const { data } = await api.post<Testimonial>('/testimonials/candidate', input);
  return data;
}
