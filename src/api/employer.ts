import { api } from './client';
import type {
  EmployerDocument,
  EmployerDocumentType,
  EmployerProfile,
  EmployerProfileInput,
} from './types';

/** POST /employer-profile */
export async function createEmployerProfile(
  input: EmployerProfileInput,
): Promise<EmployerProfile> {
  const { data } = await api.post<EmployerProfile>('/employer-profile', input);
  return data;
}

/** GET /employer-profile */
export async function getEmployerProfile(): Promise<EmployerProfile> {
  const { data } = await api.get<EmployerProfile>('/employer-profile');
  return data;
}

/** PATCH /employer-profile */
export async function updateEmployerProfile(
  input: Partial<EmployerProfileInput>,
): Promise<EmployerProfile> {
  const { data } = await api.patch<EmployerProfile>('/employer-profile', input);
  return data;
}

/** GET /employer-profile/documents */
export async function getEmployerDocuments(): Promise<EmployerDocument[]> {
  const { data } = await api.get<EmployerDocument[]>('/employer-profile/documents');
  return data;
}

/** POST /employer-profile/documents — multipart upload. */
export async function uploadEmployerDocument(
  file: File,
  documentType: EmployerDocumentType,
  onProgress?: (percent: number) => void,
): Promise<EmployerDocument> {
  const form = new FormData();
  form.append('file', file);
  form.append('documentType', documentType);
  const { data } = await api.post<EmployerDocument>('/employer-profile/documents', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return data;
}

/** DELETE /employer-profile/documents/{documentId} */
export async function deleteEmployerDocument(documentId: string): Promise<void> {
  await api.delete(`/employer-profile/documents/${documentId}`);
}
