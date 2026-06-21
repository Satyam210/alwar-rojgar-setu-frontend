import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEmployerProfile,
  deleteEmployerDocument,
  getEmployerDocuments,
  getEmployerProfile,
  updateEmployerProfile,
} from '@/api/employer';
import type { EmployerProfileInput } from '@/api/types';
import { useAuthStore } from '@/stores/authStore';

export const employerKeys = {
  profile: () => ['employer', 'profile'] as const,
  documents: () => ['employer', 'documents'] as const,
};

export function useEmployerProfile(enabled = true) {
  return useQuery({
    queryKey: employerKeys.profile(),
    queryFn: getEmployerProfile,
    enabled,
    retry: false,
  });
}

export function useCreateEmployerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EmployerProfileInput) => createEmployerProfile(input),
    onSuccess: (data) => {
      qc.setQueryData(employerKeys.profile(), data);
      const user = useAuthStore.getState().user;
      if (user) useAuthStore.getState().setUser({ ...user, profileCompleted: true });
    },
  });
}

export function useUpdateEmployerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<EmployerProfileInput>) => updateEmployerProfile(input),
    onSuccess: (data) => qc.setQueryData(employerKeys.profile(), data),
  });
}

export function useEmployerDocuments() {
  return useQuery({ queryKey: employerKeys.documents(), queryFn: getEmployerDocuments });
}

export function useDeleteEmployerDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => deleteEmployerDocument(documentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: employerKeys.documents() }),
  });
}
