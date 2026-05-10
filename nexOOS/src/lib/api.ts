import { getAppConfig } from '@config/appConfig';

const trimTrailingSlash = (value: string) => value.replace(/\/$/, '');

export function getApiBaseUrl() {
  return trimTrailingSlash(getAppConfig().apiBaseUrl);
}

export function buildApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}

export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), init);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? 'Request failed.');
  }

  return payload as T;
}

export async function postJson<TBody, TResponse>(path: string, body: TBody, init?: RequestInit) {
  return getJson<TResponse>(path, {
    ...init,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });
}
