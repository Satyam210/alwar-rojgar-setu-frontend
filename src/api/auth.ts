import { api, setAccessToken } from './client';
import type { Role } from './types';

export interface RegisterPayload {
  email: string;
  password: string;
  role: Role;
  adminInviteCode?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
}

export async function registerWithEmailPassword(payload: RegisterPayload): Promise<void> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  setAccessToken(data.accessToken);
}

export async function loginWithEmailPassword(payload: LoginPayload): Promise<void> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  setAccessToken(data.accessToken);
}

export function initiateGoogleLogin(): void {
  const apiBase = api.defaults.baseURL || 'http://localhost:4000/api/v1';
  window.location.href = `${apiBase}/auth/google`;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    setAccessToken(null);
  }
}
