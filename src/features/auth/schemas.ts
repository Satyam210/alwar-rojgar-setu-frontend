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
  password: z.string().min(1, vmsg('required')),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  role: z.enum(['candidate', 'employer']),
}).refine((data) => data.password === data.confirmPassword, {
  message: vmsg('passwordMismatch'),
  path: ['confirmPassword'],
});

export const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .length(6, vmsg('otpInvalidLength'))
    .regex(/^\d{6}$/, vmsg('otpDigitsOnly')),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: vmsg('passwordMismatch'),
  path: ['confirmPassword'],
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type OtpForm = z.infer<typeof otpSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
