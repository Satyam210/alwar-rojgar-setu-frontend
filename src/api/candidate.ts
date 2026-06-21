import { api } from './client';
import type {
  Application,
  ApplicationStatus,
  CandidateProfile,
  CandidateProfileInput,
  CertificateType,
  Paginated,
} from './types';

/** POST /candidate-profile */
export async function createCandidateProfile(
  input: CandidateProfileInput,
): Promise<CandidateProfile> {
  const { data } = await api.post<CandidateProfile>('/candidate-profile', input);
  return data;
}

/** GET /candidate-profile */
export async function getCandidateProfile(): Promise<CandidateProfile> {
  const { data } = await api.get<CandidateProfile>('/candidate-profile');
  return data;
}

/** PATCH /candidate-profile — partial update. */
export async function updateCandidateProfile(
  input: Partial<CandidateProfileInput>,
): Promise<CandidateProfile> {
  const { data } = await api.patch<CandidateProfile>('/candidate-profile', input);
  return data;
}

function uploadFile<T>(
  path: string,
  file: File,
  extra?: Record<string, string>,
  onProgress?: (percent: number) => void,
): Promise<T> {
  const form = new FormData();
  form.append('file', file);
  if (extra) Object.entries(extra).forEach(([k, v]) => form.append(k, v));
  return api
    .post<T>(path, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    })
    .then((r) => r.data);
}

/** POST /candidate-profile/resume */
export function uploadResume(file: File, onProgress?: (p: number) => void) {
  return uploadFile<CandidateProfile>('/candidate-profile/resume', file, undefined, onProgress);
}

/** POST /candidate-profile/aadhaar */
export function uploadAadhaar(file: File, onProgress?: (p: number) => void) {
  return uploadFile<CandidateProfile>('/candidate-profile/aadhaar', file, undefined, onProgress);
}

/** POST /candidate-profile/certificates */
export function uploadCertificate(
  file: File,
  documentType: CertificateType,
  onProgress?: (p: number) => void,
) {
  return uploadFile<CandidateProfile>(
    '/candidate-profile/certificates',
    file,
    { documentType },
    onProgress,
  );
}

export interface CandidateApplicationsParams {
  status?: ApplicationStatus;
  page?: number;
  limit?: number;
}

/** GET /candidate-profile/applications */
export async function getCandidateApplications(
  params: CandidateApplicationsParams = {},
): Promise<Paginated<Application>> {
  const { data } = await api.get<Paginated<Application>>('/candidate-profile/applications', {
    params,
  });
  return data;
}
