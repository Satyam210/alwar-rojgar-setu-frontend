import { api } from './client';
import type { PublicStats } from './types';

/** GET /stats — public homepage counters (no auth required). */
export async function getPublicStats(): Promise<PublicStats> {
  const { data } = await api.get<PublicStats>('/stats');
  return data;
}
