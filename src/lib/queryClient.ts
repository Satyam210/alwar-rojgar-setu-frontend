import { QueryClient } from '@tanstack/react-query';
import { asApiError } from '@/lib/errors';

/** TanStack Query client (HLD §3 — caching, pagination, background refetch). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        const status = asApiError(error)?.status;
        // Do not retry auth / client errors.
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});
