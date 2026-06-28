import { useQuery } from '@tanstack/react-query';
import { getPublicStats } from '@/api/stats';
import { searchJobs } from '@/api/jobs';

export function usePublicStats() {
  return useQuery({ queryKey: ['public', 'stats'], queryFn: getPublicStats });
}

/** GET /jobs — recent active jobs for the homepage featured section. */
export function useRecentJobs(limit = 6) {
  return useQuery({
    queryKey: ['public', 'jobs', 'recent', limit],
    queryFn: () => searchJobs({ limit }),
    staleTime: 60_000,
  });
}
