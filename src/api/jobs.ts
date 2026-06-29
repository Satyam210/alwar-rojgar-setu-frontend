import { api } from './client';
import type { Application, Job, JobInput, JobSearchParams, Paginated } from './types';

/** GET /jobs — public search with filters + pagination. */
export async function searchJobs(params: JobSearchParams = {}): Promise<Paginated<Job>> {
  const { data } = await api.get<Paginated<Job>>('/jobs', { params });
  return data;
}

/** GET /jobs/{jobId} — public job detail. */
export async function getJob(jobId: string): Promise<Job> {
  const { data } = await api.get<Job>(`/jobs/${jobId}`);
  return data;
}

/** GET /jobs/owned — employer's own jobs. */
export async function getOwnedJobs(params: Pick<JobSearchParams, 'page' | 'limit'> = {}): Promise<Paginated<Job>> {
  const { data } = await api.get<Paginated<Job>>('/jobs/owned', { params });
  return data;
}

/** POST /jobs — create job (employer). */
export async function createJob(input: JobInput): Promise<Job> {
  const { data } = await api.post<Job>('/jobs', input);
  return data;
}

/** PATCH /jobs/{jobId} — update job. */
export async function updateJob(jobId: string, input: Partial<JobInput>): Promise<Job> {
  const { data } = await api.patch<Job>(`/jobs/${jobId}`, input);
  return data;
}

/** PATCH /jobs/{jobId}/close */
export async function closeJob(jobId: string): Promise<Job> {
  const { data } = await api.patch<Job>(`/jobs/${jobId}/close`, {});
  return data;
}

/** PATCH /jobs/{jobId}/reopen — reopen a closed job (sets status to active, resets posted_at). */
export async function reopenJob(jobId: string): Promise<Job> {
  const { data } = await api.patch<Job>(`/jobs/${jobId}/reopen`, {});
  return data;
}

/** GET /jobs/{jobId}/applications — applicants for a job (employer/admin). */
export async function getJobApplicants(jobId: string): Promise<Paginated<Application>> {
  const { data } = await api.get<Paginated<Application>>(`/jobs/${jobId}/applications`);
  return data;
}
