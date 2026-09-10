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
  /**
   * Email the account signed in with (email/password or Google). Used to
   * pre-fill the email field during profile onboarding. May be absent for
   * phone-only accounts or older backends.
   */
  email?: string | null;
  profileCompleted: boolean;
  /**
   * Whether the user has completed/updated their profile. Distinguishes a
   * brand-new user (false) from a returning one (true) so the app can pick the
   * right landing page and gate job applications. Falls back to
   * `profileCompleted` when the backend doesn't send it.
   */
  profileUpdated?: boolean;
  /** Backend CR (HLD §9.5): exposed so guards / disabled-account state work. */
  isActive?: boolean;
  /** Only present for employer role. Reflects employer_profiles.status. */
  employerStatus?: 'pending' | 'verified' | 'rejected';
}

// --- Candidate ---------------------------------------------------------------

export interface CandidateProfile {
  id: UUID;
  userId: UUID;
  fullName: string;
  /** Candidate-supplied contact (HLD decision #5 / backend CR #1). */
  email?: string | null;
  /** Contact phone the employer can reach the candidate on. */
  phone?: string | null;
  /** Short self-description / bio (≤100 words) shown to employers. */
  description?: string | null;
  highestEducation?: string | null;
  itiTrade?: string | null;
  /** Which ITI the candidate studied at (department reporting / grouping). */
  itiCollege?: string | null;
  /** Department / branch within the ITI (e.g. Electrical, Mechanical). */
  department?: string | null;
  graduationYear?: number | null;
  workExperienceMonths?: number | null;
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
  /** Short public description of the company (shown on the profile). */
  description?: string | null;
  /** URL of the uploaded company logo/icon. */
  logoUrl?: string | null;
  /** Distinguishes the company owner from a delegated HR Head account. */
  employerRole?: EmployerRole;
  /** Contact person the admin/candidates can reach the company through. */
  contactPersonName?: string | null;
  contactPersonPhone?: string | null;
  contactPersonEmail?: string | null;
  contactPersonDesignation?: string | null;
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
  | 'companyName'
  | 'gstNumber'
  | 'udyamNumber'
  | 'description'
  | 'logoUrl'
  | 'contactPersonName'
  | 'contactPersonPhone'
  | 'contactPersonEmail'
  | 'contactPersonDesignation'
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
  /** Monthly gross salary. */
  grossSalary: number;
  /** Deprecated: net/take-home salary is no longer collected; kept optional for legacy rows. */
  netSalary?: number | null;
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
  companyLogoUrl?: string | null;
  companyDescription?: string | null;
  /** Set by GET /jobs/recommended — relative skill-overlap score (higher = better). */
  matchScore?: number;
  /** Set by GET /jobs/recommended — candidate skills/trade that matched this job. */
  matchedSkills?: string[];
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
  /** Free-text keyword — matches job title, skill/trade, company or description. */
  q?: string;
  district?: string;
  tradeRequired?: string;
  jobType?: JobType;
  minSalary?: number;
  maxSalary?: number;
  companyName?: string;
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

/** Legacy field, kept only because some historical admin rows still carry a status. */
export type AdminStatus = 'pending' | 'approved' | 'rejected';

/** A current admin user, shown on the Admin Users page. */
export interface AdminUser {
  userId: UUID;
  name: string | null;
  email: string;
  adminStatus: AdminStatus | null;
  isActive?: boolean;
  createdAt?: ISODateString;
}

/** An email granted admin access ahead of time, not yet registered. */
export interface AdminInvite {
  id: UUID;
  email: string;
  invitedByName: string | null;
  invitedByEmail: string | null;
  createdAt: ISODateString;
}

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
  /** Top employers by number of jobs posted. */
  jobsByEmployer?: { companyName: string; count: number }[];
  /** Top employers by number of rejected applications. */
  rejectionsByEmployer?: { companyName: string; count: number }[];
}

// --- Public homepage stats ---------------------------------------------------

export interface TopEmployer {
  id: UUID;
  companyName: string;
  logoUrl?: string | null;
  activeJobCount: number;
  totalApplications: number;
}

export interface PublicStats {
  activeJobs: number;
  registeredEmployers: number;
  successfulConnects: number;
  topEmployers: TopEmployer[];
}

// --- Shared pagination envelope ---------------------------------------------

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
