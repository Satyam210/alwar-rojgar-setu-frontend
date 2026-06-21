import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/config/env';

/**
 * HTTP client (HLD §3 "Axios with interceptors", §5 auth handling).
 *
 * - Access JWT (1h) is held IN MEMORY ONLY — never localStorage — XSS-safe and
 *   consistent with the backend "JWT not stored" stance.
 * - Refresh token (30d) is delivered via an httpOnly Secure cookie (backend CR
 *   #2), so the frontend never touches it directly; `withCredentials` lets the
 *   browser send it on the refresh call.
 * - On 401, a single silent refresh is attempted and the request is retried.
 */

let accessToken: string | null = null;

/** Called after login / refresh to store the short-lived access token. */
export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

/** Optional hook invoked when the session can no longer be recovered. */
type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler | null = null;
export function setOnSessionExpired(handler: SessionExpiredHandler | null): void {
  onSessionExpired = handler;
}

export const api: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// De-duplicate concurrent refreshes: many requests may 401 at once.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ accessToken: string }>(
        `${env.apiBaseUrl}/auth/token/refresh`,
        {},
        { withCredentials: true },
      )
      .then((res) => {
        const token = res.data?.accessToken ?? null;
        setAccessToken(token);
        return token;
      })
      .catch(() => {
        setAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

    const isAuthEndpoint = original?.url?.includes('/auth/');
    if (error.response?.status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      const token = await refreshAccessToken();
      if (token) {
        original.headers.set('Authorization', `Bearer ${token}`);
        return api(original);
      }
      onSessionExpired?.();
    }

    return Promise.reject(normaliseError(error));
  },
);

export interface ApiError {
  status: number;
  message: string;
  /** Field-level validation errors keyed by field name, when provided. */
  fieldErrors?: Record<string, string>;
  raw?: unknown;
}

function normaliseError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0;
  const data = error.response?.data as
    | { message?: string; error?: string; fieldErrors?: Record<string, string> }
    | undefined;
  return {
    status,
    message:
      data?.message ??
      data?.error ??
      (status === 0 ? 'Network error. Please check your connection.' : 'Something went wrong.'),
    fieldErrors: data?.fieldErrors,
    raw: error.response?.data,
  };
}
