import { fetchJson } from '@/utils/apiClient';
import { profileStorage, tokenStorage } from '@/utils/storage';
import type { UserProfile } from '@/types';

type AuthResponse = {
  token?: string;
  accessToken?: string;
  user?: UserProfile;
};

type RegisterResponse = AuthResponse & {
  message?: string;
  requiresVerification?: boolean;
  registrationToken?: string;
};

type PasswordResetResponse = {
  message?: string;
  resetToken?: string;
};

type UpdateProfileInput = {
  full_name?: string;
  phone?: string;
  birthday?: string;
  address?: string;
  profile_image?: string | null;
};

const saveTokenFromResponse = async (payload: AuthResponse) => {
  const token = payload.token ?? payload.accessToken;

  if (token) {
    await tokenStorage.set(token);
  }

  if (payload.user) {
    await profileStorage.set(payload.user);
  }

  return payload;
};

export const login = async (email: string, password: string, rememberMe = false) =>
  saveTokenFromResponse(
    await fetchJson<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    }),
  );

export const register = async (input: {
  full_name: string;
  email: string;
  phone: string;
  birthday: string;
  gender: string;
  password: string;
  verificationCode?: string;
  registrationToken?: string;
}) => {
  const response = await fetchJson<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
  });

  if (response.token || response.accessToken) {
    await saveTokenFromResponse(response);
  }

  return response;
};

export const requestPasswordReset = (email: string) =>
  fetchJson<PasswordResetResponse>('/auth/request-password-reset', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const verifyPasswordResetCode = (input: {
  email: string;
  verificationCode: string;
  resetToken: string;
}) =>
  fetchJson<PasswordResetResponse>('/auth/verify-password-reset-code', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const updatePasswordWithReset = (input: {
  email: string;
  verificationCode: string;
  resetToken: string;
  newPassword: string;
}) =>
  fetchJson<PasswordResetResponse>('/auth/update-password', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const getCurrentUser = () =>
  fetchJson<UserProfile>('/auth/me', {
    auth: true,
  });

export const updateProfile = async (input: UpdateProfileInput) => {
  const profile = await fetchJson<UserProfile>('/auth/update-profile', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(input),
  });

  await profileStorage.set(profile);
  return profile;
};

export const logout = async () => {
  await tokenStorage.clear();
  await profileStorage.clear();
};
