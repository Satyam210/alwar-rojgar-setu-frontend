import { z } from 'zod';
import { vmsg } from '@/lib/validation';

const currentYear = new Date().getFullYear();

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === '' ? undefined : v));

export const candidateProfileSchema = z.object({
  fullName: z.string().trim().min(2, vmsg('required')),
  email: z
    .string()
    .trim()
    .email(vmsg('emailInvalid'))
    .optional()
    .or(z.literal('')),
  highestEducation: optionalString,
  itiTrade: optionalString,
  itiCollege: optionalString,
  department: optionalString,
  graduationYear: z.coerce
    .number()
    .int()
    .min(1980, vmsg('yearInvalid'))
    .max(currentYear, vmsg('yearInvalid'))
    .optional()
    .or(z.literal('').transform(() => undefined)),
  workExperienceMonths: z.coerce
    .number()
    .int()
    .min(0, vmsg('numberInvalid'))
    .max(600)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  expectedSalary: z.coerce
    .number()
    .int()
    .min(0, vmsg('numberInvalid'))
    .optional()
    .or(z.literal('').transform(() => undefined)),
  skills: z.array(z.string().trim().min(1)).optional(),
  city: optionalString,
  district: optionalString,
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, vmsg('pincodeInvalid'))
    .optional()
    .or(z.literal('')),
});

export type CandidateProfileForm = z.input<typeof candidateProfileSchema>;
