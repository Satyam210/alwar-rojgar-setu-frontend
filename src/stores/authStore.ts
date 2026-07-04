import { create } from 'zustand';
import type { CurrentUser, Role } from '@/api/types';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  user: CurrentUser | null;
  setUser: (user: CurrentUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  reset: () => void;
  hasRole: (role: Role) => boolean;
}

/**
 * Client state for the auth session only (HLD §3 — Zustand for auth + language).
 * The access token itself lives in memory inside the axios client, not here.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  user: null,
  setUser: (user) =>
    set({ user, status: user ? 'authenticated' : 'unauthenticated' }),
  setStatus: (status) => set({ status }),
  reset: () => set({ user: null, status: 'unauthenticated' }),
  hasRole: (role) => get().user?.role === role,
}));

/**
 * Whether the user has completed their profile. Prefers the backend
 * `profileUpdated` flag and falls back to `profileCompleted` (older API / mocks).
 */
export function isProfileComplete(user: Pick<CurrentUser, 'profileCompleted' | 'profileUpdated'> | null | undefined): boolean {
  if (!user) return false;
  return user.profileUpdated ?? user.profileCompleted;
}
