/**
 * Resolve whether the in-browser mock backend should be used.
 *
 * Precedence:
 *   1. `?mock=` URL query param (runtime override) — `?mock`, `?mock=true`,
 *      `?mock=1` force static/mock data; `?mock=false` / `?mock=0` force the
 *      real backend.
 *   2. `VITE_USE_MOCKS` build-time env var.
 *   3. Default: ON in dev, OFF in prod.
 *
 * TEMPORARY: the query-param override is a demo escape hatch so the app can be
 * shown on static data without a live backend. Remove once the real API is
 * stable (delete this override branch; keep the env-var default).
 */
function resolveUseMocks(): boolean {
  const envDefault =
    (import.meta.env.VITE_USE_MOCKS ?? (import.meta.env.DEV ? 'true' : 'false')) === 'true';

  if (typeof window !== 'undefined') {
    const param = new URLSearchParams(window.location.search).get('mock');
    if (param !== null) {
      return param !== 'false' && param !== '0';
    }
  }

  return envDefault;
}

/**
 * Centralised, typed access to build-time environment configuration.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  /**
   * Base URL for the page-translation proxy (`POST /translate`). Kept separate
   * from `apiBaseUrl` because the translate route may live on a different
   * backend than the main API (e.g. the hosted demo backend doesn't have it,
   * but a local backend does). Falls back to `apiBaseUrl` when unset.
   */
  translateApiBaseUrl:
    import.meta.env.VITE_TRANSLATE_API_BASE_URL ??
    import.meta.env.VITE_API_BASE_URL ??
    '/api/v1',
  /**
   * Serve the app from an in-browser mock backend instead of the network.
   * Defaults to ON in dev so the FE is usable without a backend; set
   * VITE_USE_MOCKS=false (or use `?mock=false`) to hit the real API proxy.
   */
  useMocks: resolveUseMocks(),
  helplineNumber: import.meta.env.VITE_HELPLINE_NUMBER ?? '1800-000-0000',
  grievanceOfficer: {
    name: import.meta.env.VITE_GRIEVANCE_OFFICER_NAME ?? '',
    designation: import.meta.env.VITE_GRIEVANCE_OFFICER_DESIGNATION ?? '',
    email: import.meta.env.VITE_GRIEVANCE_OFFICER_EMAIL ?? '',
    phone: import.meta.env.VITE_GRIEVANCE_OFFICER_PHONE ?? '',
  },
} as const;
