import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Role } from '@/api/types';
import { useAuthStore } from '@/stores/authStore';
import { paths, postLoginPath } from './paths';
import { LoadingState } from '@/components/common/States';

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
    return <Navigate to={postLoginPath(user.role, user.profileCompleted)} replace />;
  }

  return <Outlet />;
}

/**
 * For candidate/employer areas: force onboarding until the profile is complete,
 * but allow the onboarding route itself.
 */
export function RequireProfile({ onboardingPath }: { onboardingPath: string }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (user && !user.profileCompleted && location.pathname !== onboardingPath) {
    return <Navigate to={onboardingPath} replace />;
  }
  return <Outlet />;
}

/** Redirect already-authenticated users away from the login page. */
export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const loading = useWaitForSession();
  const user = useAuthStore((s) => s.user);
  if (loading) return <LoadingState />;
  if (user && user.isActive !== false) {
    return <Navigate to={postLoginPath(user.role, user.profileCompleted)} replace />;
  }
  return <>{children}</>;
}
