import type {
  AdminDashboardMetrics,
  AdminUser,
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

add('POST', '/auth/register', (ctx) => {
  const email = String(ctx.body.email ?? '').toLowerCase();
  const password = String(ctx.body.password ?? '');
  const role = ctx.body.role as Role;

  if (!email || !password) throw new HttpError(400, 'Email and password are required');
  if (password.length < 8) throw new HttpError(400, 'Password must be at least 8 characters');

  let user = ctx.db.users.find((u) => u.email === email);
  if (!user) {
    user = {
      userId: `u-${Math.random().toString(36).slice(2, 9)}`,
      email,
      role: role || 'candidate',
      profileCompleted: false,
      isActive: true,
      createdAt: now(),
    };
    ctx.db.users.push(user);
  }
  ctx.db.sessionUserId = user.userId;
  persist();
  return reply({ accessToken: `mock.${user.userId}` }, 201);
});

add('POST', '/auth/login', (ctx) => {
  const email = String(ctx.body.email ?? '').toLowerCase();
  const password = String(ctx.body.password ?? '');

  if (!email || !password) throw new HttpError(400, 'Email and password are required');

  const user = ctx.db.users.find((u) => u.email === email);
  if (!user) throw new HttpError(401, 'Invalid credentials');
  if (!user.isActive) throw new HttpError(403, 'Account is disabled');

  ctx.db.sessionUserId = user.userId;
  persist();
  return reply({ accessToken: `mock.${user.userId}` });
});

add('POST', '/auth/logout', (ctx) => {
  ctx.db.sessionUserId = null;
  persist();
  return reply({ ok: true });
});

add('POST', '/auth/change-password', (ctx) => {
  requireUser(ctx);
  const currentPassword = String(ctx.body.currentPassword ?? '');
  const newPassword = String(ctx.body.newPassword ?? '');
  if (!currentPassword || !newPassword) {
    throw new HttpError(400, 'Current and new password are required');
  }
  if (newPassword.length < 8) throw new HttpError(400, 'Password must be at least 8 characters');
  if (newPassword === currentPassword) {
    throw new HttpError(400, 'New password must be different from the current password');
  }
  // The mock backend does not store passwords, so we can't verify the current
  // one — accept and report success so the flow is demoable.
  return reply({ message: 'Password changed successfully.' });
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
    email: user.email ?? null,
    profileCompleted: user.profileCompleted,
    profileUpdated: user.profileCompleted,
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
    description:
      (ctx.body.description as string) ?? existing?.description ?? null,
    logoUrl: existing?.logoUrl ?? null,
    contactPersonName:
      (ctx.body.contactPersonName as string) ?? existing?.contactPersonName ?? null,
    contactPersonPhone:
      (ctx.body.contactPersonPhone as string) ?? existing?.contactPersonPhone ?? null,
    contactPersonEmail:
      (ctx.body.contactPersonEmail as string) ?? existing?.contactPersonEmail ?? null,
    contactPersonDesignation:
      (ctx.body.contactPersonDesignation as string) ?? existing?.contactPersonDesignation ?? null,
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
  const body = ctx.body as Partial<EmployerProfile>;
  const target = profile as unknown as Record<string, unknown>;
  // Only overwrite fields the client actually sent (partial update).
  for (const key of [
    'companyName',
    'description',
    'gstNumber',
    'udyamNumber',
    'logoUrl',
    'contactPersonName',
    'contactPersonPhone',
    'contactPersonEmail',
    'contactPersonDesignation',
  ] as const) {
    if (body[key] !== undefined) target[key] = body[key];
  }
  profile.updatedAt = now();
  persist();
  return profile;
});

add('POST', '/employer-profile/logo', (ctx) => {
  const profile = employerOf(ctx, requireRole(ctx, 'employer'));
  profile.logoUrl = `mock://uploads/${uid('logo')}`;
  profile.updatedAt = now();
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

  // Unique candidates who submitted applications
  const uniqueCandidates = new Set(applications.map((a: any) => a.candidateId));

  // Top employers by active jobs + applications
  const employerStats = employerProfiles.map((ep: any) => {
    const employerJobs = jobs.filter((j: any) => j.employerId === ep.id);
    const activeJobCount = employerJobs.filter((j: any) => j.status === 'active').length;
    const totalApplications = applications.filter((a: any) =>
      employerJobs.some((j: any) => j.id === a.jobId)
    ).length;
    return {
      id: ep.id,
      companyName: ep.companyName,
      logoUrl: ep.logoUrl,
      activeJobCount,
      totalApplications,
    };
  });

  const topEmployers = employerStats
    .sort((a: any, b: any) => b.activeJobCount - a.activeJobCount || b.totalApplications - a.totalApplications)
    .slice(0, 5);

  return {
    activeJobs: jobs.filter((j: any) => j.status === 'active').length,
    registeredEmployers: employerProfiles.length,
    successfulConnects: uniqueCandidates.size,
    topEmployers,
  };
});

// --- Jobs -------------------------------------------------------------------

add('GET', '/jobs', (ctx) => {
  const q = ctx.query;
  let items = ctx.db.jobs.filter((j) => j.status === 'active');
  if (q.q) {
    const term = String(q.q).toLowerCase();
    items = items.filter((j) =>
      [j.title, j.tradeRequired, j.companyName, j.description]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    );
  }
  if (q.district) items = items.filter((j) => j.district === q.district);
  if (q.tradeRequired) items = items.filter((j) => j.tradeRequired === q.tradeRequired);
  if (q.jobType) items = items.filter((j) => j.jobType === q.jobType);
  if (q.minSalary) items = items.filter((j) => j.grossSalary >= Number(q.minSalary));
  if (q.maxSalary) items = items.filter((j) => j.grossSalary <= Number(q.maxSalary));
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

add('GET', '/jobs/recommended', (ctx) => {
  const profile = candidateOf(ctx, requireRole(ctx, 'candidate'));
  const terms = [...(profile.skills ?? []), profile.itiTrade].filter(Boolean).map(String);
  if (terms.length === 0) return paginate([], ctx.query);

  const limitRaw = Number(ctx.query.limit);
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 20) : 6;

  const scored = ctx.db.jobs
    .filter((j) => j.status === 'active')
    .map((job) => {
      const haystack = [job.title, job.description, job.tradeRequired]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchedSkills: string[] = [];
      let matchScore = 0;
      for (const raw of terms) {
        const term = raw.trim();
        if (term && haystack.includes(term.toLowerCase())) {
          if (!matchedSkills.includes(term)) matchedSkills.push(term);
          matchScore += 1;
        }
      }
      if (
        profile.itiTrade &&
        job.tradeRequired &&
        profile.itiTrade.toLowerCase() === job.tradeRequired.toLowerCase()
      ) {
        matchScore += 3;
      }
      if (
        matchScore > 0 &&
        profile.district &&
        job.district &&
        profile.district.toLowerCase() === job.district.toLowerCase()
      ) {
        matchScore += 1;
      }
      return { ...job, matchScore, matchedSkills };
    })
    .filter((j) => j.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return paginate(scored, { ...ctx.query, limit: scored.length || 1 });
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
    netSalary: b.netSalary != null ? Number(b.netSalary) : null,
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
  const jobsByEmployer = employerProfiles
    .map((e) => ({
      companyName: e.companyName,
      count: jobs.filter((j) => j.employerId === e.id).length,
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const rejectionsByEmployer = employerProfiles
    .map((e) => {
      const jobIds = new Set(jobs.filter((j) => j.employerId === e.id).map((j) => j.id));
      return {
        companyName: e.companyName,
        count: applications.filter((a) => a.status === 'rejected' && jobIds.has(a.jobId)).length,
      };
    })
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
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
    jobsByEmployer,
    rejectionsByEmployer,
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
  if (ctx.query.trade) items = items.filter((c) => c.itiTrade === ctx.query.trade);
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

// --- Admin management: current admins + grant/invite access -----------------

function toAdminUser(u: MockUser): AdminUser {
  return {
    userId: u.userId,
    name: u.name ?? 'Admin',
    email: u.email ?? '',
    adminStatus: u.adminStatus ?? 'approved',
    isActive: u.isActive,
    createdAt: u.createdAt,
  };
}

add('GET', '/admin/admins', (ctx) => {
  requireRole(ctx, 'admin');
  const mapped = ctx.db.users
    .filter((u) => u.role === 'admin')
    .map(toAdminUser)
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  return paginate(mapped, ctx.query);
});

add('GET', '/admin/admin-invites', (ctx) => {
  requireRole(ctx, 'admin');
  const invites = [...ctx.db.adminInvites].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return reply({ data: invites });
});

add('DELETE', '/admin/admin-invites/:inviteId', (ctx) => {
  requireRole(ctx, 'admin');
  const before = ctx.db.adminInvites.length;
  ctx.db.adminInvites = ctx.db.adminInvites.filter((i) => i.id !== ctx.params.inviteId);
  if (ctx.db.adminInvites.length === before) throw new HttpError(404, 'Invite not found.');
  persist();
  return reply({ message: 'Invite cancelled' });
});

/**
 * Grant admin access by email. Promotes an existing account immediately;
 * otherwise stores an invite. (The mock doesn't wire invite-consumption into
 * every signup handler — that's exercised against the real backend instead.)
 */
add('POST', '/admin/admins/grant', (ctx) => {
  const admin = requireRole(ctx, 'admin');
  const email = String(ctx.body.email ?? '').toLowerCase().trim();
  if (!email) throw new HttpError(400, 'Email is required.');

  const existing = ctx.db.users.find((u) => u.email === email);
  if (existing) {
    if (existing.role === 'admin') throw new HttpError(409, 'This user is already an admin');
    existing.role = 'admin';
    existing.adminStatus = 'approved';
    existing.isActive = true;
    persist();
    return reply({ kind: 'promoted', user: toAdminUser(existing) }, 201);
  }

  let invite = ctx.db.adminInvites.find((i) => i.email === email);
  if (!invite) {
    invite = {
      id: uid('invite'),
      email,
      invitedByName: admin.name ?? null,
      invitedByEmail: admin.email ?? null,
      createdAt: new Date().toISOString(),
    };
    ctx.db.adminInvites.push(invite);
  }
  persist();
  return reply({ kind: 'invited', invite }, 201);
});

// --- token / user resolution ------------------------------------------------

export function resolveUser(authorization: string | null): MockUser | null {
  if (!authorization) return null;
  const token = authorization.replace(/^Bearer\s+/i, '');
  if (!token.startsWith('mock.')) return null;
  const userId = token.slice('mock.'.length);
  return getDb().users.find((u) => u.userId === userId) ?? null;
}
