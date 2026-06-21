import { api, setAccessToken } from './client';
import type { Role } from './types';

export interface RequestOtpPayload {
  phone: string;
  role?: Role;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

interface VerifyOtpResponse {
  accessToken: string;
}

/** POST /auth/otp/request */
export async function requestOtp(payload: RequestOtpPayload): Promise<void> {
  await api.post('/auth/otp/request', payload);
}

/** POST /auth/otp/verify — stores the in-memory access token on success. */
export async function verifyOtp(payload: VerifyOtpPayload): Promise<void> {
  const { data } = await api.post<VerifyOtpResponse>('/auth/otp/verify', payload);
  setAccessToken(data.accessToken);
}

/** POST /auth/logout — clears the server-side refresh token, then drops local token. */
export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    setAccessToken(null);
  }
}
