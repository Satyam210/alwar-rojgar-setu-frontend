import { z } from 'zod';
import { vmsg } from '@/lib/validation';

export const emailSchema = z
  .string()
  .trim()
  .email(vmsg('emailInvalid'))
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, vmsg('passwordTooShort'));

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  role: z.enum(['candidate', 'employer', 'admin']),
  adminInviteCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: vmsg('passwordMismatch'),
  path: ['confirmPassword'],
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
