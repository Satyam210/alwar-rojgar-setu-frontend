/**
 * Centralised, typed access to build-time environment configuration.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  /**
   * Serve the app from an in-browser mock backend instead of the network.
   * Defaults to ON in dev so the FE is usable without a backend; set
   * VITE_USE_MOCKS=false to hit the real API proxy.
   */
  useMocks:
    (import.meta.env.VITE_USE_MOCKS ?? (import.meta.env.DEV ? 'true' : 'false')) === 'true',
  helplineNumber: import.meta.env.VITE_HELPLINE_NUMBER ?? '1800-000-0000',
  grievanceOfficer: {
    name: import.meta.env.VITE_GRIEVANCE_OFFICER_NAME ?? '',
    designation: import.meta.env.VITE_GRIEVANCE_OFFICER_DESIGNATION ?? '',
    email: import.meta.env.VITE_GRIEVANCE_OFFICER_EMAIL ?? '',
    phone: import.meta.env.VITE_GRIEVANCE_OFFICER_PHONE ?? '',
  },
} as const;
