import type { JobType } from '@/api/types';

/** Locations covered by the pilot; used by the Find Jobs "Location" filter (PRD). Sorted alphabetically. */
export const DISTRICTS = [
  'Alwar',
  'Behror',
  'Bhiwadi',
  'Kishangarh Bas',
  'Mundawar',
  'Neemrana',
  'Rajgarh',
  'Thanagazi',
  'Tijara',
] as const;

/**
 * ITI trades offered across Alwar district ITIs (Govt. ITI Alwar & Govt. Women
 * ITI Alwar admission lists). Sorted alphabetically for the trade dropdown.
 */
export const ITI_TRADES = [
  'Computer Operator and Programming Assistant (COPA)',
  'Cosmetology',
  'Diesel Mechanic',
  'Draughtsman',
  'Dress Making',
  'Electrician',
  'Fashion Design & Technology',
  'Fitter',
  'Foundryman',
  'Front Office Assistant',
  'Interior Design and Decoration',
  'Machinist',
  'Mechanic Auto Electrical and Electronics',
  'Motor Vehicle Mechanic',
  'Plastic Processing Operator',
  'Plumber',
  'Refrigeration & AC',
  'Solar Technician (Electrical)',
  'Stenographer & Secretarial Assistant (English)',
  'Stenographer & Secretarial Assistant (Hindi)',
  'Tool & Die Maker (Press Tools, Jigs & Fixtures)',
  'Turner',
  'Welder',
  'Wireman',
  'Wood Work Technician (Carpenter)',
] as const;

/**
 * Suggested skills for the candidate skills input (free-text; these are only
 * autocomplete hints). Built from the ITI trades plus common workplace skills.
 */
export const SKILL_SUGGESTIONS = [
  ...ITI_TRADES,
  'Basic Computer Knowledge',
  'MS Office',
  'Tally',
  'AutoCAD',
  'Machine Operation',
  'Quality Inspection',
  'Blueprint Reading',
  'Preventive Maintenance',
  'Housekeeping / 5S',
  'Forklift Operation',
  'Data Entry',
  'Customer Service',
  'Communication',
  'Teamwork',
  'Hindi',
  'English',
] as const;

/**
 * Colleges in Alwar district — used only as optional autocomplete suggestions
 * for the (free-text) college field. Candidates may type any college name.
 */
export const ALWAR_COLLEGES = [
  'Babu Shobha Ram Government Arts College, Alwar',
  'G. D. Govt. College for Women, Alwar',
  'Government College Govindgarh, Alwar',
  'Government College Malakhera, Alwar',
  'Government College Mubarikpur, Alwar',
  'Government College Reni, Alwar',
  'Government College, Rajgarh, Alwar',
  'Government Commerce College, Alwar',
  'Government Girls College Bahadurpur, Alwar',
  'Government Girls College Baroda Meo, Alwar',
  'Government Girls College Pratapgarh, Alwar',
  'Government Girls College Rajgarh, Alwar',
  'Government Girls College Kherli Ganj, Alwar',
  'Government PG College, Thanagazi, Alwar',
  'Govt. College Tehla, Alwar',
  'Govt. College Laxmangarh, Alwar',
  'Govt. College Ramgarh, Alwar',
  'Raj Rishi College, Alwar',
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
