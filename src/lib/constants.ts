import type { JobType } from '@/api/types';

/**
 * Districts shown in the UI. The portal covers **Alwar** only for now. (After
 * Rajasthan's 2023 reorganisation, Kotputli-Behror and Khairthal-Tijara are
 * separate districts and are intentionally NOT listed here yet.)
 */
export const DISTRICTS = ['Alwar'] as const;

export type District = (typeof DISTRICTS)[number];

/**
 * Towns / tehsils grouped by district. Drives the dependent "Town / City"
 * dropdown. Candidates whose town isn't listed pick {@link OTHER_TOWN} and type it.
 */
export const TOWNS_BY_DISTRICT: Record<District, readonly string[]> = {
  Alwar: [
    'Alwar',
    'Thanagazi',
    'Rajgarh',
    'Laxmangarh',
    'Reni',
    'Malakhera',
    'Govindgarh',
    'Kathumar',
    'Tehla',
  ],
};

/** Sentinel dropdown value for a town not in {@link TOWNS_BY_DISTRICT} (reveals free-text). */
export const OTHER_TOWN = '__other__';

/** Sentinel dropdown value for a district not in {@link DISTRICTS} (reveals free-text). */
export const OTHER_DISTRICT = '__other_district__';

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
 * Government & private ITIs across Alwar district (source: District ITI list).
 * Used to populate the candidate "College name" dropdown. Candidates who
 * studied elsewhere pick {@link OTHER_COLLEGE} and type their institute name.
 * Sorted alphabetically for the dropdown.
 */
export const ITI_COLLEGES = [
  'ANSH PVT. ITI, KANDOLI (ALWAR)',
  'ARAVALI PVT. ITI, ALWAR',
  'ARAWALI PVT. ITI, KATHOOMAR (ALWAR)',
  'ARNOLD PVT. ITI, BILANDI (ALWAR)',
  'ASHUDEEP PVT. ITI, KHERLI (ALWAR)',
  'BASSO DEVI LAXMAN SINGH PVT. ITI, SAHAJPURA (ALWAR)',
  'BRIJLATA PVT. ITI, LAXMANGARH (ALWAR)',
  'CHETANYA PVT. ITI, KHERLI (ALWAR)',
  'DEEP PVT. ITI, RAJGARH (ALWAR)',
  'DHRUV PVT. ITI, ALWAR',
  'E.T.C. PVT. ITI, ALWAR',
  'EVEREST PVT. ITI, ALWAR',
  'GAURAV PVT. ITI, ALWAR',
  'GOVT. ITI JAIL CAMPUS, ALWAR',
  'GOVT. ITI, ALWAR',
  'GOVT. ITI, KATHOOMAR (ALWAR)',
  'GOVT. ITI, LACHHMANGARH (ALWAR)',
  'GOVT. ITI, RAJGARH (ALWAR)',
  'GOVT. ITI, RAMGARH, SAHAJPURA (ALWAR)',
  'GOVT. ITI, RENI, PARBAINI (ALWAR)',
  'GOVT. ITI, SAHDOLI (ALWAR)',
  'GOVT. ITI, THANAGAZI (ALWAR)',
  'GOVT. ITI, UMREN (ALWAR)',
  'GOVT. WOMEN ITI, ALWAR',
  'GYANDEEP PVT. ITI, BHARKOL (ALWAR)',
  'H.K. MEMORIAL PVT. ITI, ALWAR',
  'HASAN KHAN MEWATI PVT. ITI, ALWAR',
  'JAI DURGA PANCHWATI PVT. ITI, BHEEKAMPURA (ALWAR)',
  'JAI DURGA PVT. ITI, ANGARI (ALWAR)',
  'LABHANSHIKA PVT. ITI, KAROTH ( RURAL ) (ALWAR)',
  'M.S. PVT. ITI, ALWAR',
  'MANVI PVT. ITI, NATHOOSAR (ALWAR)',
  'MATSAYA PVT. ITI, BARODA MEO (ALWAR)',
  'MATSYA LOK SEWA PVT. ITI, ALWAR',
  'MG PVT. ITI, RAMGARH (CT) (ALWAR)',
  'NAVODAYA PVT. ITI, ALWAR',
  'P.K. MEMORIAL PVT. ITI, TITPURI (ALWAR)',
  'PRAGATI PVT. ITI, RAJGARH (ALWAR)',
  'PRET RAJ PVT. ITI, ALWAR',
  'R.R. PVT. ITI, RAJGARH (ALWAR)',
  'RAJRISHI PVT. ITI, KHERLI (ALWAR)',
  'RANJEET ROYAL PVT. ITI, PADA (ALWAR)',
  'RAO PVT. ITI, KOTHI NARAYANPUR (ALWAR)',
  'REGIONAL PVT. ITI, KHERLI (ALWAR)',
  'SANKALP PVT. ITI, RAJGARH (ALWAR)',
  'SARASWATI PVT. ITI, BHOOGAR (CT) (ALWAR)',
  'SARASWATI PVT. ITI, RENI (ALWAR)',
  'SAROJDEVI PVT. ITI, KHERI (ALWAR)',
  'SARVESH PVT. ITI, MOONPUR (ALWAR)',
  'SHREE MATSYA PVT. ITI, KHERLI (ALWAR)',
  'SHREE SHYAM PVT. ITI, SAMOOCHI (ALWAR)',
  'SHRI AGRASEN PVT. ITI, BARODA MEO (ALWAR)',
  'SHRI GANESH PVT. ITI, PINAN (ALWAR)',
  'SHRI HEERANAND PVT. ITI, ALWAR',
  'SHRI KRISHNA PVT. ITI, SONKHAR ( RURAL ) (ALWAR)',
  'SHRI NATH PVT. ITI, ALWAR',
  'SHRI SAI PVT. ITI, RENI (ALWAR)',
  'SHRI VINAYAK PVT. ITI, THANAGAZI (ALWAR)',
  'SHRI VISHWAKARMA PVT. ITI, THANA (ALWAR)',
  'SHUKLA PVT. ITI, THANAGAZI (ALWAR)',
  'VANSHIKA PVT. ITI, MALA KHERA (ALWAR)',
  'VIDHYASTHALI PVT. ITI, NANGLA MADHOPUR (ALWAR)',
  'VIKASH PVT. ITI, CHIKANI (ALWAR)',
  'VINAYAK PVT. ITI, BAHTOO KHURD (ALWAR)',
  'VIVEKANAND PVT. ITI, RAJGARH (ALWAR)',
] as const;

/**
 * Sentinel dropdown value for candidates whose college/ITI is not in
 * {@link ITI_COLLEGES}; selecting it reveals a free-text input.
 */
export const OTHER_COLLEGE = '__other__';

/**
 * Degree colleges in Alwar district — retained as optional autocomplete
 * suggestions for any free-text college field.
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
