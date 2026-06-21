import { z } from 'zod';
import { vmsg } from '@/lib/validation';

export const employerProfileSchema = z.object({
  companyName: z.string().trim().min(2, vmsg('required')),
  gstNumber: z
    .string()
    .trim()
    .regex(/^[0-9A-Z]{15}$/, vmsg('gstInvalid'))
    .optional()
    .or(z.literal('')),
  udyamNumber: z.string().trim().optional().or(z.literal('')),
});

export type EmployerProfileForm = z.input<typeof employerProfileSchema>;

export const jobSchema = z
  .object({
    title: z.string().trim().min(2, vmsg('required')),
    description: z.string().trim().min(10, vmsg('required')),
    grossSalary: z.coerce.number().int().min(1, vmsg('numberInvalid')),
    netSalary: z.coerce.number().int().min(1, vmsg('numberInvalid')),
    jobType: z.enum(['permanent', 'contract', 'internship']),
    openings: z.coerce.number().int().min(1, vmsg('min', { min: 1 })),
    tradeRequired: z.string().trim().optional().or(z.literal('')),
    district: z.string().trim().min(1, vmsg('required')),
  })
  .refine((v) => v.netSalary <= v.grossSalary, {
    message: vmsg('netGreaterThanGross'),
    path: ['netSalary'],
  });

export type JobForm = z.input<typeof jobSchema>;
