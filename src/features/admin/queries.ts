import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelAdminInvite,
  disableUser,
  enableUser,
  getAdmins,
  getAdminCandidates,
  getAdminDashboard,
  getAdminEmployers,
  getAdminInvites,
  grantAdminAccess,
  verifyEmployer,
  type AdminListParams,
  type AdminUserListParams,
  type VerifyEmployerPayload,
} from '@/api/admin';
import {
  adminGetTestimonials,
  adminCreateTestimonial,
  adminUpdateTestimonial,
  adminDeleteTestimonial,
} from '@/api/testimonials';
import type { TestimonialInput } from '@/api/types';

export const adminKeys = {
  dashboard: () => ['admin', 'dashboard'] as const,
  employers: (params: AdminListParams) => ['admin', 'employers', params] as const,
  candidates: (params: AdminListParams) => ['admin', 'candidates', params] as const,
  admins: (params: AdminUserListParams) => ['admin', 'admins', params] as const,
  adminInvites: () => ['admin', 'admin-invites'] as const,
  testimonials: () => ['admin', 'testimonials'] as const,
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

export function useAdmins(params: AdminUserListParams) {
  return useQuery({
    queryKey: adminKeys.admins(params),
    queryFn: () => getAdmins(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminInvites() {
  return useQuery({ queryKey: adminKeys.adminInvites(), queryFn: getAdminInvites });
}

export function useGrantAdminAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => grantAdminAccess(email),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'admins'] });
      qc.invalidateQueries({ queryKey: adminKeys.adminInvites() });
    },
  });
}

export function useCancelAdminInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => cancelAdminInvite(inviteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.adminInvites() });
    },
  });
}

export function useAdminTestimonials() {
  return useQuery({
    queryKey: adminKeys.testimonials(),
    queryFn: adminGetTestimonials,
  });
}

export function useCreateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TestimonialInput) => adminCreateTestimonial(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.testimonials() });
      qc.invalidateQueries({ queryKey: ['public', 'testimonials'] });
    },
  });
}

export function useUpdateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TestimonialInput> }) =>
      adminUpdateTestimonial(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.testimonials() });
      qc.invalidateQueries({ queryKey: ['public', 'testimonials'] });
    },
  });
}

export function useDeleteTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDeleteTestimonial(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.testimonials() });
      qc.invalidateQueries({ queryKey: ['public', 'testimonials'] });
    },
  });
}
