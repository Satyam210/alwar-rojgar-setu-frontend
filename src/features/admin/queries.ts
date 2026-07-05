import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveAdmin,
  disableUser,
  enableUser,
  getAdminAdmins,
  getAdminCandidates,
  getAdminDashboard,
  getAdminEmployers,
  rejectAdmin,
  verifyEmployer,
  type AdminListParams,
  type AdminUserListParams,
  type VerifyEmployerPayload,
} from '@/api/admin';

export const adminKeys = {
  dashboard: () => ['admin', 'dashboard'] as const,
  employers: (params: AdminListParams) => ['admin', 'employers', params] as const,
  candidates: (params: AdminListParams) => ['admin', 'candidates', params] as const,
  admins: (params: AdminUserListParams) => ['admin', 'admins', params] as const,
};

export function useAdminDashboard() {
  return useQuery({ queryKey: adminKeys.dashboard(), queryFn: getAdminDashboard });
}

export function useAdminEmployers(params: AdminListParams) {
  return useQuery({
    queryKey: adminKeys.employers(params),
    queryFn: () => getAdminEmployers(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminCandidates(params: AdminListParams) {
  return useQuery({
    queryKey: adminKeys.candidates(params),
    queryFn: () => getAdminCandidates(params),
    placeholderData: (prev) => prev,
  });
}

export function useVerifyEmployer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: VerifyEmployerPayload }) =>
      verifyEmployer(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'employers'] });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

export function useToggleUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, enable }: { userId: string; enable: boolean }) =>
      enable ? enableUser(userId) : disableUser(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'employers'] });
      qc.invalidateQueries({ queryKey: ['admin', 'candidates'] });
    },
  });
}

export function useAdminAdmins(params: AdminUserListParams) {
  return useQuery({
    queryKey: adminKeys.admins(params),
    queryFn: () => getAdminAdmins(params),
    placeholderData: (prev) => prev,
  });
}

export function useReviewAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, approve }: { userId: string; approve: boolean }) =>
      approve ? approveAdmin(userId) : rejectAdmin(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'admins'] });
    },
  });
}
