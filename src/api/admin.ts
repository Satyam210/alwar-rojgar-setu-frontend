import { api } from './client';
import type {
  AdminDashboardMetrics,
  AdminInvite,
  AdminRole,
  AdminUser,
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
  /** Candidate-only: filter the list to a single ITI trade. */
  trade?: string;
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

// --- Admin management: current admins + grant/invite access ------------------

export interface AdminUserListParams {
  page?: number;
  limit?: number;
  search?: string;
}

/** GET /admin/admins — list current admins. */
export async function getAdmins(params: AdminUserListParams = {}): Promise<Paginated<AdminUser>> {
  const { data } = await api.get<Paginated<AdminUser>>('/admin/admins', { params });
  return data;
}

export type GrantAdminResult =
  | { kind: 'promoted'; user: AdminUser }
  | { kind: 'invited'; invite: AdminInvite };

/**
 * POST /admin/admins/grant — grant admin access by email. Promotes an
 * existing account immediately, or stores an invite that's consumed the
 * moment that email signs up.
 */
export async function grantAdminAccess(email: string, adminRole: AdminRole = 'read_only'): Promise<GrantAdminResult> {
  const { data } = await api.post<GrantAdminResult>('/admin/admins/grant', { email, adminRole });
  return data;
}

/** GET /admin/admin-invites — list emails granted admin access but not yet registered. */
export async function getAdminInvites(): Promise<{ data: AdminInvite[] }> {
  const { data } = await api.get<{ data: AdminInvite[] }>('/admin/admin-invites');
  return data;
}

/** DELETE /admin/admin-invites/{inviteId} — cancel a pending admin invite. */
export async function cancelAdminInvite(inviteId: string): Promise<void> {
  await api.delete(`/admin/admin-invites/${inviteId}`);
}
