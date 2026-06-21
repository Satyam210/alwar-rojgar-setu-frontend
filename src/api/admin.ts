import { api } from './client';
import type {
  AdminDashboardMetrics,
  CandidateProfile,
  EmployerProfile,
  EmployerStatus,
  Paginated,
} from './types';

/** GET /admin/dashboard */
export async function getAdminDashboard(): Promise<AdminDashboardMetrics> {
  const { data } = await api.get<AdminDashboardMetrics>('/admin/dashboard');
  return data;
}

export interface AdminListParams {
  page?: number;
  limit?: number;
  status?: EmployerStatus;
  search?: string;
  /** Candidate-only: filter the list to a single ITI department / branch. */
  department?: string;
}

/** GET /admin/employers */
export async function getAdminEmployers(
  params: AdminListParams = {},
): Promise<Paginated<EmployerProfile>> {
  const { data } = await api.get<Paginated<EmployerProfile>>('/admin/employers', { params });
  return data;
}

/** GET /admin/employers/{employerId} */
export async function getAdminEmployer(employerId: string): Promise<EmployerProfile> {
  const { data } = await api.get<EmployerProfile>(`/admin/employers/${employerId}`);
  return data;
}

export interface VerifyEmployerPayload {
  status: Extract<EmployerStatus, 'verified' | 'rejected'>;
  reason?: string;
}

/** PATCH /admin/employers/{employerId}/verification */
export async function verifyEmployer(
  employerId: string,
  payload: VerifyEmployerPayload,
): Promise<EmployerProfile> {
  const { data } = await api.patch<EmployerProfile>(
    `/admin/employers/${employerId}/verification`,
    payload,
  );
  return data;
}

/** GET /admin/candidates */
export async function getAdminCandidates(
  params: AdminListParams = {},
): Promise<Paginated<CandidateProfile>> {
  const { data } = await api.get<Paginated<CandidateProfile>>('/admin/candidates', { params });
  return data;
}

/** GET /admin/candidates/{candidateId} */
export async function getAdminCandidate(candidateId: string): Promise<CandidateProfile> {
  const { data } = await api.get<CandidateProfile>(`/admin/candidates/${candidateId}`);
  return data;
}

/** PATCH /admin/users/{userId}/disable */
export async function disableUser(userId: string): Promise<void> {
  await api.patch(`/admin/users/${userId}/disable`, {});
}

/** PATCH /admin/users/{userId}/enable */
export async function enableUser(userId: string): Promise<void> {
  await api.patch(`/admin/users/${userId}/enable`, {});
}
