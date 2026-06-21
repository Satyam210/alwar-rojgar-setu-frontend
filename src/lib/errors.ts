import type { ApiError } from '@/api/client';

/** Safely extract a user-facing message from any thrown/mutation error. */
export function apiErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message?: unknown }).message ?? 'Something went wrong.');
  }
  return 'Something went wrong.';
}

/** Narrowing helper when the full ApiError shape is needed. */
export function asApiError(err: unknown): ApiError | undefined {
  if (err && typeof err === 'object' && 'status' in err) return err as ApiError;
  return undefined;
}
