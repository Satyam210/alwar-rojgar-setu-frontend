import { api } from './client';
import type { Application, ApplicationStatus } from './types';

/** POST /job-applications — candidate applies to a job. */
export async function applyToJob(jobId: string): Promise<Application> {
  const { data } = await api.post<Application>('/job-applications', { jobId });
  return data;
}

export interface UpdateApplicationStatusPayload {
  status: ApplicationStatus;
  reason?: string;
  /** Hire-only: confirm the placement was made through the platform. */
  attributedToPlatform?: boolean;
  /** Hire-only: the candidate's confirmed joining date (ISO). */
  joiningDate?: string;
}

/** PATCH /job-applications/{applicationId}/status — employer/admin action. */
export async function updateApplicationStatus(
  applicationId: string,
  payload: UpdateApplicationStatusPayload,
): Promise<Application> {
  const { data } = await api.patch<Application>(
    `/job-applications/${applicationId}/status`,
    payload,
  );
  return data;
}
