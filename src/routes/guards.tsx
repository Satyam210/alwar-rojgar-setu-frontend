import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Role } from '@/api/types';
import { useAuthStore, isProfileComplete } from '@/stores/authStore';
import { paths, postLoginPath } from './paths';
import { LoadingState } from '@/components/common/States';
import { toast } from '@/components/ui/toast';

/**
 * Route guards (HLD §5): gate by role; candidates/employers are pushed to
 * onboarding until their profile exists; disabled accounts are routed out.
 */

function useWaitForSession(): boolean {
  const status = useAuthStore((s) => s.status);
  return status === 'idle' || status === 'loading';
}

export function RequireAuth({ requiredRole }: { requiredRole?: Role }) {
  const loading = useWaitForSession();
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (loading) return <LoadingState />;

  if (!user) {
    return <Navigate to={paths.login} state={{ from: location.pathname }} replace />;
  }

  // Disabled account → dedicated state (handled on login page banner).
  if (user.isActive === false) {
    return <Navigate to={paths.login} state={{ disabled: true }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={postLoginPath(user.role, isProfileComplete(user))} replace />;
  }

  return <Outlet />;
}

/**
 * For candidate/employer areas: force onboarding until the profile is complete,
 * but allow the onboarding route itself. Explains the redirect with a toast so
 * the user understands why they can't reach the page (e.g. My Jobs) yet.
 */
export function RequireProfile({
  onboardingPath,
  variant,
}: {
  onboardingPath: string;
  variant: 'candidate' | 'employer';
}) {
  const { t } = useTranslation('common');
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const shouldRedirect = Boolean(
    user && !isProfileComplete(user) && location.pathname !== onboardingPath,
  );

  useEffect(() => {
    if (!shouldRedirect) return;
    toast.error(
      variant === 'employer'
        ? t('guards.completeEmployerProfile')
        : t('guards.completeCandidateProfile'),
    );
  }, [shouldRedirect, variant, t]);

  if (shouldRedirect) return <Navigate to={onboardingPath} replace />;
  return <Outlet />;
}

/** Redirect already-authenticated users away from the login page. */
export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const loading = useWaitForSession();
  const user = useAuthStore((s) => s.user);
  if (loading) return <LoadingState />;
  if (user && user.isActive !== false) {
    return <Navigate to={postLoginPath(user.role, isProfileComplete(user))} replace />;
  }
  return <>{children}</>;
}
