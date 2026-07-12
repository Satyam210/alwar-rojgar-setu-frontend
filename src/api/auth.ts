import { api, setAccessToken } from './client';
import type { Role } from './types';

export interface SendOtpPayload {
  email: string;
  password: string;
  role: Role;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
}

export interface ConflictError {
  message: string;
  conflictMethod: 'email' | 'google';
}

export async function sendOtp(payload: SendOtpPayload): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/auth/send-otp', payload);
  return data;
}

export async function verifyOtpAndRegister(payload: VerifyOtpPayload): Promise<{ pending: boolean }> {
  const { data } = await api.post<AuthResponse & { pending?: boolean }>('/auth/verify-otp', payload);
  if (data.pending) return { pending: true };
  setAccessToken(data.accessToken);
  return { pending: false };
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: Role;
}

export async function loginWithEmailPassword(payload: LoginPayload): Promise<void> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  setAccessToken(data.accessToken);
}

export function initiateGoogleLogin(): void {
  const apiBase = api.defaults.baseURL || '/api/v1';
  window.location.href = `${apiBase}/auth/google`;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    setAccessToken(null);
  }
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email });
  return data;
}

export async function resetPassword(payload: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/auth/reset-password', payload);
  return data;
}
