import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { RedirectIfAuthed, RequireAuth, RequireProfile } from './guards';
import { paths } from './paths';

import { HomePage } from '@/features/public/HomePage';
import { JobsPage } from '@/features/public/JobsPage';
import { JobDetailPage } from '@/features/public/JobDetailPage';
import {
  AccessibilityPage,
  GrievancePage,
  NotFoundPage,
  PrivacyPage,
  TermsPage,
} from '@/features/public/StaticPages';
import { LoginPage } from '@/features/auth/LoginPage';
import { GoogleOAuthCallback } from '@/features/auth/GoogleOAuthCallback';

import { CandidateOnboardingPage } from '@/features/candidate/OnboardingPage';
import { CandidateProfilePage } from '@/features/candidate/ProfilePage';
import { CandidateApplicationsPage } from '@/features/candidate/ApplicationsPage';

import { EmployerOnboardingPage } from '@/features/employer/OnboardingPage';
import { EmployerProfilePage } from '@/features/employer/ProfilePage';
import { EmployerJobsPage } from '@/features/employer/JobsPage';
import { EmployerApplicantsPage } from '@/features/employer/ApplicantsPage';

import { AdminDashboardPage } from '@/features/admin/DashboardPage';
import { AdminEmployersPage } from '@/features/admin/EmployersPage';
import { AdminCandidatesPage } from '@/features/admin/CandidatesPage';
import { AdminUsersPage } from '@/features/admin/UsersPage';
import { AdminTestimonialsPage } from '@/features/admin/TestimonialsPage';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      // Public
      { path: paths.home, element: <HomePage /> },
      { path: paths.jobs, element: <JobsPage /> },
      { path: paths.jobDetail(), element: <JobDetailPage /> },
      { path: paths.accessibility, element: <AccessibilityPage /> },
      { path: paths.privacy, element: <PrivacyPage /> },
      { path: paths.terms, element: <TermsPage /> },
      { path: paths.grievance, element: <GrievancePage /> },
      {
        path: paths.login,
        element: (
          <RedirectIfAuthed>
            <LoginPage />
          </RedirectIfAuthed>
        ),
      },
      {
        path: '/auth/google/callback',
        element: <GoogleOAuthCallback />,
      },

      // Candidate
      {
        element: <RequireAuth requiredRole="candidate" />,
        children: [
          {
            element: <RequireProfile onboardingPath={paths.candidate.onboarding} variant="candidate" />,
            children: [
              { path: paths.candidate.onboarding, element: <CandidateOnboardingPage /> },
              { path: paths.candidate.profile, element: <CandidateProfilePage /> },
              { path: paths.candidate.applications, element: <CandidateApplicationsPage /> },
            ],
          },
        ],
      },

      // Employer
      {
        element: <RequireAuth requiredRole="employer" />,
        children: [
          {
            element: <RequireProfile onboardingPath={paths.employer.onboarding} variant="employer" />,
            children: [
              { path: paths.employer.onboarding, element: <EmployerOnboardingPage /> },
              { path: paths.employer.profile, element: <EmployerProfilePage /> },
              { path: paths.employer.jobs, element: <EmployerJobsPage /> },
              { path: paths.employer.applicants(), element: <EmployerApplicantsPage /> },
            ],
          },
        ],
      },

      // Admin
      {
        element: <RequireAuth requiredRole="admin" />,
        children: [
          { path: paths.admin.dashboard, element: <AdminDashboardPage /> },
          { path: paths.admin.employers, element: <AdminEmployersPage /> },
          { path: paths.admin.candidates, element: <AdminCandidatesPage /> },
          { path: paths.admin.users, element: <AdminUsersPage /> },
          { path: paths.admin.testimonials, element: <AdminTestimonialsPage /> },
        ],
      },

      { path: '404', element: <NotFoundPage /> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
],
  {
    basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
  },
);
