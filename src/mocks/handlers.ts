import type {
  AdminDashboardMetrics,
  Application,
  ApplicationStatus,
  CandidateProfile,
  EmployerProfile,
  Job,
  Paginated,
  Role,
} from '@/api/types';
import { getDb, persist, type MockDb, type MockUser } from './db';

/** Error that the adapter turns into an axios-style rejection. */
export class HttpError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;
  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export interface HandlerCtx {
  params: Record<string, string>;
  query: Record<string, unknown>;
  body: Record<string, unknown>;
  formData: FormData | null;
  db: MockDb;
  user: MockUser | null;
}

export interface HandlerResult {
  __envelope: true;
  status: number;
  data: unknown;
}

/** Wrap a payload with an explicit status. Bare returns default to 200. */
function reply(data: unknown, status = 200): HandlerResult {
  return { __envelope: true, status, data };
}

interface Route {
  method: string;
  pattern: RegExp;
  keys: string[];
  handler: (ctx: HandlerCtx) => HandlerResult | unknown;
}

const routes: Route[] = [];

function add(method: string, path: string, handler: Route['handler']): void {
  const keys: string[] = [];
  const pattern = new RegExp(
    '^' +
      path.replace(/:[^/]+/g, (m) => {
        keys.push(m.slice(1));
        return '([^/]+)';
      }) +
      '/?$',
  );
  routes.push({ method: method.toUpperCase(), pattern, keys, handler });
}

export function matchRoute(method: string, path: string) {
  for (const route of routes) {
    if (route.method !== method.toUpperCase()) continue;
    const m = route.pattern.exec(path);
    if (!m) continue;
    const params: Record<string, string> = {};
    route.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
    return { route, params };
  }
  return null;
}

// --- helpers ----------------------------------------------------------------

const now = () => new Date().toISOString();
const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

function paginate<T>(items: T[], query: Record<string, unknown>): Paginated<T> {
  const page = Math.max(1, Number(query.page ?? 1) || 1);
  const limit = Math.max(1, Number(query.limit ?? 10) || 10);
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    page,
    limit,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / limit)),
  };
}

function requireUser(ctx: HandlerCtx): MockUser {
  if (!ctx.user) throw new HttpError(401, 'Authentication required.');
  if (ctx.user.isActive === false) throw new HttpError(403, 'Account disabled.');
  return ctx.user;
}

function requireRole(ctx: HandlerCtx, role: Role): MockUser {
  const user = requireUser(ctx);
  if (user.role !== role) throw new HttpError(403, 'Not allowed for this role.');
  return user;
}

function candidateOf(ctx: HandlerCtx, user: MockUser): CandidateProfile {
  const profile = ctx.db.candidateProfiles.find((c) => c.userId === user.userId);
  if (!profile) throw new HttpError(404, 'Candidate profile not found.');
  return profile;
}

function employerOf(ctx: HandlerCtx, user: MockUser): EmployerProfile {
  const profile = ctx.db.employerProfiles.find((e) => e.userId === user.userId);
  if (!profile) throw new HttpError(404, 'Employer profile not found.');
  return profile;
}

function withJob(ctx: HandlerCtx, app: Application): Application {
  return { ...app, job: ctx.db.jobs.find((j) => j.id === app.jobId) };
}

function withCandidate(ctx: HandlerCtx, app: Application): Application {
  return { ...app, candidate: ctx.db.candidateProfiles.find((c) => c.id === app.candidateId) };
}

const STATUS_STAMP: Record<ApplicationStatus, keyof Application | null> = {
  received: null,
  viewed: 'viewedAt',
  shortlisted: 'shortlistedAt',
  rejected: 'rejectedAt',
  hired: 'hiredAt',
};

// --- Auth -------------------------------------------------------------------

add('POST', '/auth/otp/request', (ctx) => {
  const phone = String(ctx.body.phone ?? '');
  if (ctx.body.role) ctx.db.pendingRole[phone] = ctx.body.role as Role;
  persist();
  return reply({ sent: true });
});

add('POST', '/auth/otp/verify', (ctx) => {
  const phone = String(ctx.body.phone ?? '');
  const role = ctx.db.pendingRole[phone] ?? 'candidate';
  // Role decides the canonical demo account.
  const user =
    ctx.db.users.find((u) => u.phone === phone && u.role === role) ??
    ctx.db.users.find((u) => u.role === role);
  if (!user) throw new HttpError(400, 'No demo account for that role.');
  ctx.db.sessionUserId = user.userId;
  persist();
  return reply({ accessToken: `mock.${user.userId}` });
});

add('POST', '/auth/logout', (ctx) => {
  ctx.db.sessionUserId = null;
  persist();
  return reply({ ok: true });
});

add('POST', '/auth/token/refresh', (ctx) => {
  const id = ctx.db.sessionUserId;
  const user = id ? ctx.db.users.find((u) => u.userId === id) : null;
  if (!user || user.isActive === false) throw new HttpError(401, 'No active session.');
  return reply({ accessToken: `mock.${user.userId}` });
});

// --- Users ------------------------------------------------------------------

add('GET', '/users/current', (ctx) => {
  const user = requireUser(ctx);
  return {
    userId: user.userId,
    role: user.role,
    profileCompleted: user.profileCompleted,
    isActive: user.isActive,
  };
});

// --- Candidate profile ------------------------------------------------------

add('POST', '/candidate-profile', (ctx) => {
  const user = requireRole(ctx, 'candidate');
  const existing = ctx.db.candidateProfiles.find((c) => c.userId === user.userId);
  const profile = {
    ...(existing ?? {}),
    ...(ctx.body as Partial<CandidateProfile>),
    id: existing?.id ?? uid('cp'),
    userId: user.userId,
    isActive: true,
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  } as CandidateProfile;
  if (existing) {
    Object.assign(existing, profile);
  } else {
    ctx.db.candidateProfiles.push(profile);
  }
  user.profileCompleted = true;
  persist();
  return reply(profile, existing ? 200 : 201);
});

add('GET', '/candidate-profile', (ctx) => candidateOf(ctx, requireRole(ctx, 'candidate')));

add('PATCH', '/candidate-profile', (ctx) => {
  const profile = candidateOf(ctx, requireRole(ctx, 'candidate'));
  Object.assign(profile, ctx.body, { updatedAt: now() });
  persist();
  return profile;
});

function candidateFileUpload(field: keyof CandidateProfile) {
  return (ctx: HandlerCtx) => {
    const profile = candidateOf(ctx, requireRole(ctx, 'candidate'));
    (profile as unknown as Record<string, unknown>)[field as string] = `mock://uploads/${uid('file')}`;
    if (field === 'aadhaarUrl') profile.aadhaarVerified = true;
    profile.updatedAt = now();
    persist();
    return profile;
  };
}

add('POST', '/candidate-profile/resume', candidateFileUpload('resumeUrl'));
add('POST', '/candidate-profile/aadhaar', candidateFileUpload('aadhaarUrl'));
add('POST', '/candidate-profile/certificates', (ctx) => {
  const profile = candidateOf(ctx, requireRole(ctx, 'candidate'));
  const type = ctx.formData?.get('documentType');
  const map: Record<string, keyof CandidateProfile> = {
    ITI_CERTIFICATE: 'itiCertificateUrl',
    DIPLOMA_CERTIFICATE: 'diplomaCertificateUrl',
    DEGREE_CERTIFICATE: 'degreeCertificateUrl',
    EXPERIENCE_LETTER: 'experienceLetterUrl',
  };
  const field = map[String(type)] ?? 'itiCertificateUrl';
  (profile as unknown as Record<string, unknown>)[field as string] = `mock://uploads/${uid('cert')}`;
  profile.updatedAt = now();
  persist();
  return profile;
});

add('GET', '/candidate-profile/applications', (ctx) => {
  const profile = candidateOf(ctx, requireRole(ctx, 'candidate'));
  let items = ctx.db.applications.filter((a) => a.candidateId === profile.id);
  if (ctx.query.status) items = items.filter((a) => a.status === ctx.query.status);
  items = items
    .map((a) => withJob(ctx, a))
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  return paginate(items, ctx.query);
});

// --- Employer profile -------------------------------------------------------

add('POST', '/employer-profile', (ctx) => {
  const user = requireRole(ctx, 'employer');
  const existing = ctx.db.employerProfiles.find((e) => e.userId === user.userId);
  const profile: EmployerProfile = {
    id: existing?.id ?? uid('ep'),
    userId: user.userId,
    companyName: String(ctx.body.companyName ?? existing?.companyName ?? ''),
    gstNumber: (ctx.body.gstNumber as string) ?? existing?.gstNumber ?? null,
    udyamNumber: (ctx.body.udyamNumber as string) ?? existing?.udyamNumber ?? null,
    status: existing?.status ?? 'pending',
    isActive: true,
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  };
  if (existing) {
    Object.assign(existing, profile);
  } else {
    ctx.db.employerProfiles.push(profile);
  }
  user.profileCompleted = true;
  persist();
  return reply(profile, existing ? 200 : 201);
});

add('GET', '/employer-profile', (ctx) => employerOf(ctx, requireRole(ctx, 'employer')));

add('PATCH', '/employer-profile', (ctx) => {
  const profile = employerOf(ctx, requireRole(ctx, 'employer'));
  const { companyName, gstNumber, udyamNumber } = ctx.body as Partial<EmployerProfile>;
  Object.assign(
    profile,
    { companyName, gstNumber, udyamNumber },
    { updatedAt: now() },
  );
  persist();
  return profile;
});

add('GET', '/employer-profile/documents', (ctx) => {
  const profile = employerOf(ctx, requireRole(ctx, 'employer'));
  return ctx.db.employerDocuments.filter((d) => d.employerId === profile.id);
});

add('POST', '/employer-profile/documents', (ctx) => {
  const profile = employerOf(ctx, requireRole(ctx, 'employer'));
  const doc = {
    id: uid('doc'),
    employerId: profile.id,
    documentType: String(ctx.formData?.get('documentType') ?? 'OTHER'),
    documentUrl: `mock://uploads/${uid('file')}`,
    verificationStatus: 'pending' as const,
    uploadedAt: now(),
  };
  ctx.db.employerDocuments.push(doc as never);
  persist();
  return reply(doc, 201);
});

add('DELETE', '/employer-profile/documents/:id', (ctx) => {
  const profile = employerOf(ctx, requireRole(ctx, 'employer'));
  ctx.db.employerDocuments = ctx.db.employerDocuments.filter(
    (d) => !(d.id === ctx.params.id && d.employerId === profile.id),
  );
  persist();
  return reply(null, 204);
});

// --- Public stats -----------------------------------------------------------

add('GET', '/stats', (ctx) => {
  const { jobs, employerProfiles, applications } = ctx.db;
  return {
    activeJobs: jobs.filter((j) => j.status === 'active').length,
    registeredEmployers: employerProfiles.length,
    successfulHires: applications.filter((a) => a.status === 'hired').length,
  };
});

// --- Jobs -------------------------------------------------------------------

add('GET', '/jobs', (ctx) => {
  const q = ctx.query;
  let items = ctx.db.jobs.filter((j) => j.status === 'active');
  if (q.district) items = items.filter((j) => j.district === q.district);
  if (q.tradeRequired) items = items.filter((j) => j.tradeRequired === q.tradeRequired);
  if (q.jobType) items = items.filter((j) => j.jobType === q.jobType);
  if (q.minSalary) items = items.filter((j) => j.netSalary >= Number(q.minSalary));
  if (q.maxSalary) items = items.filter((j) => j.netSalary <= Number(q.maxSalary));
  if (q.companyName) items = items.filter((j) => j.companyName === q.companyName);
  items = items.sort((a, b) => (b.postedAt ?? '').localeCompare(a.postedAt ?? ''));
  return paginate(items, q);
});

add('GET', '/jobs/owned', (ctx) => {
  const profile = employerOf(ctx, requireRole(ctx, 'employer'));
  const items = ctx.db.jobs
    .filter((j) => j.employerId === profile.id)
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  return paginate(items, { ...ctx.query, limit: ctx.query.limit ?? 100 });
});

add('POST', '/jobs', (ctx) => {
  const profile = employerOf(ctx, requireRole(ctx, 'employer'));
  const b = ctx.body as Partial<Job>;
  const job: Job = {
    id: uid('job'),
    employerId: profile.id,
    companyName: profile.companyName,
    title: String(b.title ?? ''),
    description: String(b.description ?? ''),
    grossSalary: Number(b.grossSalary ?? 0),
    netSalary: Number(b.netSalary ?? 0),
    jobType: (b.jobType as Job['jobType']) ?? 'permanent',
    openings: Number(b.openings ?? 1),
    filledCount: 0,
    tradeRequired: (b.tradeRequired as string) ?? null,
    district: String(b.district ?? 'Alwar'),
    status: 'active',
    postedAt: now(),
    createdAt: now(),
    updatedAt: now(),
  };
  ctx.db.jobs.unshift(job);
  persist();
  return reply(job, 201);
});

add('GET', '/jobs/:id', (ctx) => {
  const job = ctx.db.jobs.find((j) => j.id === ctx.params.id);
  if (!job) throw new HttpError(404, 'Job not found.');
  return job;
});

add('PATCH', '/jobs/:id', (ctx) => {
  const profile = employerOf(ctx, requireRole(ctx, 'employer'));
  const job = ctx.db.jobs.find((j) => j.id === ctx.params.id && j.employerId === profile.id);
  if (!job) throw new HttpError(404, 'Job not found.');
  Object.assign(job, ctx.body, { updatedAt: now() });
  persist();
  return job;
});

add('PATCH', '/jobs/:id/close', (ctx) => {
  const profile = employerOf(ctx, requireRole(ctx, 'employer'));
  const job = ctx.db.jobs.find((j) => j.id === ctx.params.id && j.employerId === profile.id);
  if (!job) throw new HttpError(404, 'Job not found.');
  job.status = 'closed';
  job.updatedAt = now();
  persist();
  return job;
});

add('PATCH', '/jobs/:id/reopen', (ctx) => {
  const profile = employerOf(ctx, requireRole(ctx, 'employer'));
  const job = ctx.db.jobs.find((j) => j.id === ctx.params.id && j.employerId === profile.id);
  if (!job) throw new HttpError(404, 'Job not found.');
  job.status = 'active';
  job.postedAt = now();
  job.updatedAt = now();
  persist();
  return job;
});

add('GET', '/jobs/:id/applications', (ctx) => {
  requireUser(ctx);
  const items = ctx.db.applications
    .filter((a) => a.jobId === ctx.params.id)
    .map((a) => withCandidate(ctx, withJob(ctx, a)))
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  return paginate(items, { ...ctx.query, limit: ctx.query.limit ?? 100 });
});

// --- Applications -----------------------------------------------------------

add('POST', '/job-applications', (ctx) => {
  const profile = candidateOf(ctx, requireRole(ctx, 'candidate'));
  const jobId = String(ctx.body.jobId ?? '');
  const job = ctx.db.jobs.find((j) => j.id === jobId);
  if (!job) throw new HttpError(404, 'Job not found.');
  if (ctx.db.applications.some((a) => a.candidateId === profile.id && a.jobId === jobId)) {
    throw new HttpError(409, 'You have already applied to this job.');
  }
  const app: Application = {
    id: uid('app'),
    candidateId: profile.id,
    jobId,
    status: 'received',
    createdAt: now(),
    updatedAt: now(),
  };
  ctx.db.applications.unshift(app);
  persist();
  return reply(withJob(ctx, app), 201);
});

add('PATCH', '/job-applications/:id/status', (ctx) => {
  requireUser(ctx);
  const app = ctx.db.applications.find((a) => a.id === ctx.params.id);
  if (!app) throw new HttpError(404, 'Application not found.');
  const status = ctx.body.status as ApplicationStatus;
  app.status = status;
  const stamp = STATUS_STAMP[status];
  if (stamp) (app as unknown as Record<string, unknown>)[stamp] = now();
  if (status === 'rejected') app.rejectionReason = (ctx.body.reason as string) ?? null;
  if (status === 'hired') {
    const job = ctx.db.jobs.find((j) => j.id === app.jobId);
    if (job) job.filledCount = Math.min(job.openings, job.filledCount + 1);
    app.attributedToPlatform = Boolean(ctx.body.attributedToPlatform);
    app.joiningDate = (ctx.body.joiningDate as string) ?? null;
  }
  app.updatedAt = now();
  persist();
  return withCandidate(ctx, withJob(ctx, app));
});

// --- Admin ------------------------------------------------------------------

add('GET', '/admin/dashboard', (ctx) => {
  requireRole(ctx, 'admin');
  const { candidateProfiles, employerProfiles, jobs, applications } = ctx.db;
  const byStatus = (s: ApplicationStatus) => applications.filter((a) => a.status === s).length;
  const metrics: AdminDashboardMetrics = {
    totalCandidates: candidateProfiles.length,
    totalEmployers: employerProfiles.length,
    pendingEmployers: employerProfiles.filter((e) => e.status === 'pending').length,
    activeJobs: jobs.filter((j) => j.status === 'active').length,
    totalApplications: applications.length,
    totalPlacements: applications.filter((a) => a.status === 'hired').length,
    verifiedPlacements: applications.filter((a) => a.status === 'hired' && a.attributedToPlatform)
      .length,
    registrationsByMonth: [
      { month: 'Feb', count: 2 },
      { month: 'Mar', count: 5 },
      { month: 'Apr', count: 8 },
      { month: 'May', count: 6 },
      { month: 'Jun', count: candidateProfiles.length + employerProfiles.length },
    ],
    placementsByMonth: [
      { month: 'Feb', count: 0 },
      { month: 'Mar', count: 1 },
      { month: 'Apr', count: 2 },
      { month: 'May', count: 1 },
      { month: 'Jun', count: byStatus('hired') },
    ],
    applicationsByStatus: (
      ['received', 'viewed', 'shortlisted', 'rejected', 'hired'] as ApplicationStatus[]
    ).map((status) => ({ status, count: byStatus(status) })),
  };
  return metrics;
});

function adminList<T extends { isActive?: boolean }>(
  items: T[],
  ctx: HandlerCtx,
  search: (item: T, term: string) => boolean,
) {
  let result = items;
  if (ctx.query.search) {
    const term = String(ctx.query.search).toLowerCase();
    result = result.filter((item) => search(item, term));
  }
  return paginate(result, ctx.query);
}

add('GET', '/admin/employers', (ctx) => {
  requireRole(ctx, 'admin');
  let items = ctx.db.employerProfiles;
  if (ctx.query.status) items = items.filter((e) => e.status === ctx.query.status);
  return adminList(items, ctx, (e, term) => e.companyName.toLowerCase().includes(term));
});

add('GET', '/admin/employers/:id', (ctx) => {
  requireRole(ctx, 'admin');
  const e = ctx.db.employerProfiles.find((x) => x.id === ctx.params.id);
  if (!e) throw new HttpError(404, 'Employer not found.');
  return e;
});

add('PATCH', '/admin/employers/:id/verification', (ctx) => {
  const admin = requireRole(ctx, 'admin');
  const e = ctx.db.employerProfiles.find((x) => x.id === ctx.params.id);
  if (!e) throw new HttpError(404, 'Employer not found.');
  e.status = ctx.body.status as EmployerProfile['status'];
  e.verifiedBy = admin.userId;
  e.verifiedAt = now();
  e.rejectionReason = e.status === 'rejected' ? ((ctx.body.reason as string) ?? null) : null;
  e.updatedAt = now();
  persist();
  return e;
});

add('GET', '/admin/candidates', (ctx) => {
  requireRole(ctx, 'admin');
  let items = ctx.db.candidateProfiles;
  if (ctx.query.department) items = items.filter((c) => c.department === ctx.query.department);
  return adminList(items, ctx, (c, term) => c.fullName.toLowerCase().includes(term));
});

add('GET', '/admin/candidates/:id', (ctx) => {
  requireRole(ctx, 'admin');
  const c = ctx.db.candidateProfiles.find((x) => x.id === ctx.params.id);
  if (!c) throw new HttpError(404, 'Candidate not found.');
  return c;
});

function setActive(ctx: HandlerCtx, active: boolean) {
  requireRole(ctx, 'admin');
  const userId = ctx.params.id;
  const user = ctx.db.users.find((u) => u.userId === userId);
  if (user) user.isActive = active;
  ctx.db.candidateProfiles.forEach((c) => {
    if (c.userId === userId) c.isActive = active;
  });
  ctx.db.employerProfiles.forEach((e) => {
    if (e.userId === userId) e.isActive = active;
  });
  persist();
  return reply({ ok: true });
}

add('PATCH', '/admin/users/:id/disable', (ctx) => setActive(ctx, false));
add('PATCH', '/admin/users/:id/enable', (ctx) => setActive(ctx, true));

// --- token / user resolution ------------------------------------------------

export function resolveUser(authorization: string | null): MockUser | null {
  if (!authorization) return null;
  const token = authorization.replace(/^Bearer\s+/i, '');
  if (!token.startsWith('mock.')) return null;
  const userId = token.slice('mock.'.length);
  return getDb().users.find((u) => u.userId === userId) ?? null;
}
