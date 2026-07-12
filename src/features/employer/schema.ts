import { z } from 'zod';
import { vmsg } from '@/lib/validation';

export const employerProfileSchema = z.object({
  companyName: z.string().trim().min(2, vmsg('required')),
  description: z
    .string()
    .trim()
    .max(1000, vmsg('maxLength', { count: 1000 }))
    .optional()
    .or(z.literal('')),
  contactPersonName: z.string().trim().min(2, vmsg('required')),
  contactPersonPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, vmsg('phoneInvalid')),
  contactPersonEmail: z
    .string()
    .trim()
    .email(vmsg('emailInvalid'))
    .optional()
    .or(z.literal('')),
  contactPersonDesignation: z.string().trim().optional().or(z.literal('')),
  gstNumber: z
    .string()
    .trim()
    .regex(/^[0-9A-Z]{15}$/, vmsg('gstInvalid'))
    .optional()
    .or(z.literal('')),
  udyamNumber: z.string().trim().optional().or(z.literal('')),
});

export type EmployerProfileForm = z.input<typeof employerProfileSchema>;

export const jobSchema = z.object({
  title: z.string().trim().min(2, vmsg('required')),
  description: z.string().trim().min(10, vmsg('required')),
  grossSalary: z.coerce.number().int().min(1, vmsg('numberInvalid')),
  netSalary: z.coerce.number().int().min(1, vmsg('numberInvalid')),
  jobType: z.enum(['permanent', 'contract', 'internship']),
  openings: z.coerce.number().int().min(1, vmsg('min', { min: 1 })),
  tradeRequired: z.string().trim().optional().or(z.literal('')),
  district: z.string().trim().min(1, vmsg('required')),
});

export type JobForm = z.input<typeof jobSchema>;
