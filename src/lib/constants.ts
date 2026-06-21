import type { JobType } from '@/api/types';

/** Pilot is Alwar district; keep a small list for filters (PRD). */
export const DISTRICTS = [
  'Alwar',
  'Bhiwadi',
  'Tijara',
  'Kishangarh Bas',
  'Behror',
  'Rajgarh',
  'Thanagazi',
  'Mundawar',
] as const;

/** Common ITI trades in Alwar's industrial base (PRD). */
export const ITI_TRADES = [
  'Fitter',
  'Electrician',
  'Welder',
  'Turner',
  'Machinist',
  'Diesel Mechanic',
  'Wireman',
  'Plumber',
  'COPA (Computer Operator)',
  'Draughtsman',
  'Refrigeration & AC',
  'Motor Vehicle Mechanic',
] as const;

/** ITI institutes across Alwar district (pilot list; "Other" allows free entry). */
export const ITI_COLLEGES = [
  'Govt. ITI Alwar',
  'Govt. ITI Bhiwadi',
  'Govt. ITI Tijara',
  'Govt. ITI Behror',
  'Govt. ITI Rajgarh',
  'Govt. ITI Kishangarh Bas',
  'Govt. Women ITI Alwar',
  'Private ITI Alwar',
  'Other',
] as const;

/** Departments / branches an ITI student can belong to (used for reporting). */
export const ITI_DEPARTMENTS = [
  'Electrical',
  'Mechanical',
  'Automobile',
  'Civil',
  'Electronics',
  'Computer / IT',
  'Welding & Fabrication',
  'Refrigeration & AC',
  'Production & Manufacturing',
] as const;

export const EDUCATION_LEVELS = [
  '10th Pass',
  '12th Pass',
  'ITI',
  'Diploma',
  'Graduate',
  'Post Graduate',
] as const;

export const JOB_TYPES: { value: JobType; labelKey: string }[] = [
  { value: 'permanent', labelKey: 'jobs:type.permanent' },
  { value: 'contract', labelKey: 'jobs:type.contract' },
  { value: 'internship', labelKey: 'jobs:type.internship' },
];

export const PAGE_SIZE = 10;

/** Client-side upload guards (HLD §10 — validate type/size before upload). */
export const UPLOAD_LIMITS = {
  maxSizeBytes: 5 * 1024 * 1024, // 5 MB
  acceptDocs: '.pdf,.jpg,.jpeg,.png',
  acceptImage: '.jpg,.jpeg,.png',
} as const;
