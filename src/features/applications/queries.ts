import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { applyToJob, updateApplicationStatus } from '@/api/applications';
import {
  getCandidateApplications,
  type CandidateApplicationsParams,
} from '@/api/candidate';
import type { UpdateApplicationStatusPayload } from '@/api/applications';
import { jobKeys } from '@/features/jobs/queries';

export const applicationKeys = {
  candidate: (params: CandidateApplicationsParams) =>
    ['applications', 'candidate', params] as const,
};

export function useCandidateApplications(params: CandidateApplicationsParams) {
  return useQuery({
    queryKey: applicationKeys.candidate(params),
    queryFn: () => getCandidateApplications(params),
    placeholderData: (prev) => prev,
  });
}

export function useApplyToJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => applyToJob(jobId),
    onSuccess: (_data, jobId) => {
      qc.invalidateQueries({ queryKey: ['applications', 'candidate'] });
      qc.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
    },
  });
}

export function useUpdateApplicationStatus(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicationId,
      payload,
    }: {
      applicationId: string;
      payload: UpdateApplicationStatusPayload;
    }) => updateApplicationStatus(applicationId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.applicants(jobId) }),
  });
}
