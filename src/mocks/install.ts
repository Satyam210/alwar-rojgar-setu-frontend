import axios from 'axios';
import { env } from '@/config/env';
import { api } from '@/api/client';
import { mockAdapter } from './adapter';
import { ensureSeeded, resetDb } from './db';
import { DEMO_EMAILS } from './seed';

/**
 * Mock backend installer. When VITE_USE_MOCKS is on (default in dev), every
 * axios request — the shared `api` instance and the bare `axios.post` used for
 * token refresh — is served from an in-memory, localStorage-backed store
 * instead of the network. Flip the flag off to use the real backend proxy.
 */
if (env.useMocks) {
  ensureSeeded();
  axios.defaults.adapter = mockAdapter;
  api.defaults.adapter = mockAdapter;

  // Dev convenience: window.__resetMockData() wipes back to seed.
  (window as unknown as { __resetMockData?: () => void }).__resetMockData = () => {
    resetDb();
    window.location.reload();
  };

  // eslint-disable-next-line no-console
  console.info(
    '%c[mocks] Alwar Rojgar Setu running on mock data',
    'color:#1d4ed8;font-weight:bold',
    `\nDemo logins: candidate ${DEMO_EMAILS.candidate}, employer ${DEMO_EMAILS.employer}, admin ${DEMO_EMAILS.admin}`,
  );
}

export const mocksEnabled = env.useMocks;
