import { useQuery } from '@tanstack/react-query';
import { getPublicStats } from '@/api/stats';

export function usePublicStats() {
  return useQuery({ queryKey: ['public', 'stats'], queryFn: getPublicStats });
}
