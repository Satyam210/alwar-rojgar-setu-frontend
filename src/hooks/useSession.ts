import { useEffect } from 'react';
import { getCurrentUser } from '@/api/users';
import { setOnSessionExpired } from '@/api/client';
import { logout as logoutApi } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import { queryClient } from '@/lib/queryClient';

/**
 * Session rehydration (HLD §5): on every app load, call GET /users/current to
 * restore role + profileCompleted. The Axios interceptor performs a silent
 * refresh first if needed, so this works across reloads via the refresh cookie.
 */
export function useSessionBootstrap(): void {
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);

  useEffect(() => {
    let cancelled = false;

    setOnSessionExpired(() => {
      useAuthStore.getState().reset();
      queryClient.clear();
    });

    setStatus('loading');
    getCurrentUser()
      .then((user) => {
        if (!cancelled) setUser(user);
      })
      .catch(() => {
        if (!cancelled) setStatus('unauthenticated');
      });

    return () => {
      cancelled = true;
      setOnSessionExpired(null);
    };
  }, [setUser, setStatus]);
}

/** Logout helper that clears server session + client state + query cache. */
export async function performLogout(): Promise<void> {
  await logoutApi();
  useAuthStore.getState().reset();
  queryClient.clear();
}
