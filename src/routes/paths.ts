/** Central route path registry (HLD §4 route map). */
export const paths = {
  home: '/',
  jobs: '/jobs',
  jobDetail: (id = ':jobId') => `/jobs/${id}`,
  login: '/login',
  accessibility: '/accessibility',
  privacy: '/privacy',
  grievance: '/grievance',
  terms: '/terms',

  candidate: {
    onboarding: '/candidate/onboarding',
    profile: '/candidate/profile',
    applications: '/candidate/applications',
  },

  employer: {
    onboarding: '/employer/onboarding',
    profile: '/employer/profile',
    jobs: '/employer/jobs',
    applicants: (jobId = ':jobId') => `/employer/jobs/${jobId}/applicants`,
  },

  admin: {
    dashboard: '/admin',
    employers: '/admin/employers',
    candidates: '/admin/candidates',
    users: '/admin/users',
  },
} as const;

/** Where to send a user after login based on role + profile completion. */
export function postLoginPath(role: string, profileCompleted: boolean): string {
  switch (role) {
    case 'candidate':
      return profileCompleted ? paths.candidate.applications : paths.candidate.onboarding;
    case 'employer':
      return profileCompleted ? paths.employer.jobs : paths.employer.onboarding;
    case 'admin':
      return paths.admin.dashboard;
    default:
      return paths.home;
  }
}
