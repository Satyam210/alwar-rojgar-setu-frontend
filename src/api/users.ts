import { api } from './client';
import type { CurrentUser } from './types';

/** GET /users/current — called on every app load to rehydrate the session. */
export async function getCurrentUser(): Promise<CurrentUser> {
  const { data } = await api.get<CurrentUser>('/users/current');
  return data;
}
