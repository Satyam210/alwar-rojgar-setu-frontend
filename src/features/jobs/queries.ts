import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  closeJob,
  createJob,
  getJob,
  getJobApplicants,
  getOwnedJobs,
  searchJobs,
  updateJob,
} from '@/api/jobs';
import type { JobInput, JobSearchParams } from '@/api/types';

export const jobKeys = {
  all: ['jobs'] as const,
  search: (params: JobSearchParams) => ['jobs', 'search', params] as const,
  detail: (id: string) => ['jobs', 'detail', id] as const,
  owned: () => ['jobs', 'owned'] as const,
  applicants: (id: string) => ['jobs', id, 'applicants'] as const,
};

export function useJobSearch(params: JobSearchParams) {
  return useQuery({
    queryKey: jobKeys.search(params),
    queryFn: () => searchJobs(params),
    placeholderData: (prev) => prev,
  });
}

export function useJob(jobId: string | undefined) {
  return useQuery({
    queryKey: jobKeys.detail(jobId ?? ''),
    queryFn: () => getJob(jobId as string),
    enabled: Boolean(jobId),
  });
}

export function useOwnedJobs() {
  return useQuery({ queryKey: jobKeys.owned(), queryFn: () => getOwnedJobs() });
}

export function useJobApplicants(jobId: string | undefined) {
  return useQuery({
    queryKey: jobKeys.applicants(jobId ?? ''),
    queryFn: () => getJobApplicants(jobId as string),
    enabled: Boolean(jobId),
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: JobInput) => createJob(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.owned() }),
  });
}

export function useUpdateJob(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<JobInput>) => updateJob(jobId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobKeys.owned() });
      qc.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
    },
  });
}

export function useCloseJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => closeJob(jobId),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.owned() }),
  });
}
