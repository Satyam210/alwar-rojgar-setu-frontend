import { z } from 'zod';
import { vmsg } from '@/lib/validation';

/** 10-digit Indian mobile number (leading 6-9). */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, vmsg('phoneInvalid'));

export const requestOtpSchema = z.object({
  phone: phoneSchema,
  role: z.enum(['candidate', 'employer', 'admin']),
});

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, vmsg('otpInvalid')),
});

export type RequestOtpForm = z.infer<typeof requestOtpSchema>;
export type VerifyOtpForm = z.infer<typeof verifyOtpSchema>;

/** Normalise to the +91 E.164 form the backend expects. */
export function toE164(phone: string): string {
  return `+91${phone.trim()}`;
}
