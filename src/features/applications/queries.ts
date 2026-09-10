import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  applyToJob,
  updateApplicationStatus,
  scheduleInterview,
  type UpdateApplicationStatusPayload,
  type ScheduleInterviewPayload,
} from '@/api/applications';
import {
  getCandidateApplications,
  type CandidateApplicationsParams,
} from '@/api/candidate';
import { jobKeys } from '@/features/jobs/queries';

export const applicationKeys = {
  candidate: (params: CandidateApplicationsParams) =>
    ['applications', 'candidate', params] as const,
};

export function useCandidateApplications(
  params: CandidateApplicationsParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: applicationKeys.candidate(params),
    queryFn: () => getCandidateApplications(params),
    placeholderData: (prev) => prev,
    enabled: options?.enabled ?? true,
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

export function useScheduleInterview(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicationId,
      payload,
    }: {
      applicationId: string;
      payload: ScheduleInterviewPayload;
    }) => scheduleInterview(applicationId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.applicants(jobId) }),
  });
}
