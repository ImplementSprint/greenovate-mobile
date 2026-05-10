import { buildApiUrl } from './api';

let accessToken: string | null = null;

export function storeAccessToken(token: string | null | undefined) {
  accessToken = token ?? null;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

export function fetchWithAuth(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return fetch(buildApiUrl(path), {
    ...init,
    headers,
  });
}
