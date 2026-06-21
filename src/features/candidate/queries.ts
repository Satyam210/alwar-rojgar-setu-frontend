import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCandidateProfile,
  getCandidateProfile,
  updateCandidateProfile,
} from '@/api/candidate';
import type { CandidateProfileInput } from '@/api/types';
import { useAuthStore } from '@/stores/authStore';

export const candidateKeys = {
  profile: () => ['candidate', 'profile'] as const,
};

export function useCandidateProfile(enabled = true) {
  return useQuery({
    queryKey: candidateKeys.profile(),
    queryFn: getCandidateProfile,
    enabled,
    retry: false,
  });
}

export function useCreateCandidateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CandidateProfileInput) => createCandidateProfile(input),
    onSuccess: (data) => {
      qc.setQueryData(candidateKeys.profile(), data);
      // Profile now exists → unlock guarded routes.
      const user = useAuthStore.getState().user;
      if (user) useAuthStore.getState().setUser({ ...user, profileCompleted: true });
    },
  });
}

export function useUpdateCandidateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CandidateProfileInput>) => updateCandidateProfile(input),
    onSuccess: (data) => qc.setQueryData(candidateKeys.profile(), data),
  });
}
