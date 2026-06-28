/**
 * Domain types mirroring the backend (Database Technical Design v1.0 +
 * API Design Refactoring Recommendations). The frontend only relies on schema
 * fields (HLD locked decision #7 — no rich job fields / trust badges).
 */

export type UUID = string;
export type ISODateString = string;

export type Role = 'candidate' | 'employer' | 'admin';

/** GET /users/current */
export interface CurrentUser {
  userId: UUID;
  role: Role;
  profileCompleted: boolean;
  /** Backend CR (HLD §9.5): exposed so guards / disabled-account state work. */
  isActive?: boolean;
}

// --- Candidate ---------------------------------------------------------------

export interface CandidateProfile {
  id: UUID;
  userId: UUID;
  fullName: string;
  /** Candidate-supplied contact (HLD decision #5 / backend CR #1). */
  email?: string | null;
  highestEducation?: string | null;
  itiTrade?: string | null;
  /** Which ITI the candidate studied at (department reporting / grouping). */
  itiCollege?: string | null;
  /** Department / branch within the ITI (e.g. Electrical, Mechanical). */
  department?: string | null;
  graduationYear?: number | null;
  workExperienceMonths?: number | null;
  expectedSalary?: number | null;
  skills?: string[];
  city?: string | null;
  district?: string | null;
  pincode?: string | null;
  resumeUrl?: string | null;
  aadhaarUrl?: string | null;
  itiCertificateUrl?: string | null;
  diplomaCertificateUrl?: string | null;
  degreeCertificateUrl?: string | null;
  experienceLetterUrl?: string | null;
  aadhaarVerified?: boolean;
  /** Exposed by admin list endpoints for account enable/disable. */
  isActive?: boolean;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

export type CandidateProfileInput = Omit<
  CandidateProfile,
  'id' | 'userId' | 'aadhaarVerified' | 'createdAt' | 'updatedAt'
>;

export type CertificateType =
  | 'ITI_CERTIFICATE'
  | 'DIPLOMA_CERTIFICATE'
  | 'DEGREE_CERTIFICATE'
  | 'EXPERIENCE_LETTER';

// --- Employer ----------------------------------------------------------------

export type EmployerStatus = 'pending' | 'verified' | 'rejected';

/** Who the logged-in employer user is within their company. */
export type EmployerRole = 'owner' | 'hr_head';

export interface EmployerProfile {
  id: UUID;
  userId: UUID;
  companyName: string;
  /** Distinguishes the company owner from a delegated HR Head account. */
  employerRole?: EmployerRole;
  /** Display name of the person operating the account (e.g. the HR Head). */
  contactPersonName?: string | null;
  gstNumber?: string | null;
  udyamNumber?: string | null;
  status: EmployerStatus;
  verifiedBy?: UUID | null;
  verifiedAt?: ISODateString | null;
  rejectionReason?: string | null;
  /** Exposed by admin list endpoints for account enable/disable. */
  isActive?: boolean;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

export type EmployerProfileInput = Pick<
  EmployerProfile,
  'companyName' | 'gstNumber' | 'udyamNumber'
>;

export type EmployerDocumentType =
  | 'GST_CERTIFICATE'
  | 'UDYAM_CERTIFICATE'
  | 'FACTORY_LICENSE'
  | 'PAN_CARD'
  | 'OTHER';

export type DocumentVerificationStatus = 'pending' | 'verified' | 'rejected';

export interface EmployerDocument {
  id: UUID;
  employerId: UUID;
  documentType: EmployerDocumentType;
  documentUrl: string;
  verificationStatus: DocumentVerificationStatus;
  uploadedAt?: ISODateString;
  verifiedAt?: ISODateString | null;
  verifiedBy?: UUID | null;
}

// --- Jobs --------------------------------------------------------------------

export type JobType = 'permanent' | 'contract' | 'internship';
/** Includes 'expired' per backend CR #3 (PRD job auto-expiry ~45 days). */
export type JobStatus = 'draft' | 'active' | 'closed' | 'filled' | 'expired';

export interface Job {
  id: UUID;
  employerId: UUID;
  title: string;
  description: string;
  grossSalary: number;
  netSalary: number;
  jobType: JobType;
  openings: number;
  filledCount: number;
  tradeRequired?: string | null;
  district: string;
  status: JobStatus;
  postedAt?: ISODateString | null;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
  /** Optional, denormalised for listing convenience. */
  companyName?: string;
}

export interface JobInput {
  title: string;
  description: string;
  grossSalary: number;
  netSalary: number;
  jobType: JobType;
  openings: number;
  tradeRequired?: string;
  district: string;
}

export interface JobSearchParams {
  district?: string;
  tradeRequired?: string;
  jobType?: JobType;
  minSalary?: number;
  maxSalary?: number;
  page?: number;
  limit?: number;
}

// --- Applications ------------------------------------------------------------

export type ApplicationStatus = 'received' | 'viewed' | 'shortlisted' | 'rejected' | 'hired';

export interface Application {
  id: UUID;
  candidateId: UUID;
  jobId: UUID;
  status: ApplicationStatus;
  viewedAt?: ISODateString | null;
  shortlistedAt?: ISODateString | null;
  rejectedAt?: ISODateString | null;
  hiredAt?: ISODateString | null;
  rejectionReason?: string | null;
  /** Hire attribution (HLD: prove the placement happened via the platform). */
  attributedToPlatform?: boolean;
  /** Candidate's confirmed joining date, captured at hire time. */
  joiningDate?: ISODateString | null;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
  /** Denormalised join data the dashboards rely on. */
  job?: Job;
  candidate?: CandidateProfile;
}

// --- Admin -------------------------------------------------------------------

export interface AdminDashboardMetrics {
  totalCandidates: number;
  totalEmployers: number;
  pendingEmployers: number;
  activeJobs: number;
  totalApplications: number;
  /** Real backend field — maps to successful hired placements. */
  successfulHires?: number;
  /** Mock/extended field — total hired applications. Falls back to successfulHires. */
  totalPlacements?: number;
  /** Mock/extended field — hired applications attributed to the platform. */
  verifiedPlacements?: number;
  registrationsByMonth?: { month: string; count: number }[];
  placementsByMonth?: { month: string; count: number }[];
  applicationsByStatus?: { status: ApplicationStatus; count: number }[];
}

// --- Public homepage stats ---------------------------------------------------

export interface PublicStats {
  activeJobs: number;
  registeredEmployers: number;
  successfulHires: number;
}

// --- Shared pagination envelope ---------------------------------------------

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
