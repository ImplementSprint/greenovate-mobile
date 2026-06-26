import { appConfig } from '@/config/appConfig';
import { tokenStorage } from '@/utils/storage';

export class ApiRequestError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.payload = payload;
  }
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });

export const buildApiUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const pathWithoutDuplicateApi = normalizedPath.startsWith('/api/')
    ? normalizedPath.slice(4)
    : normalizedPath;

  return `${appConfig.apiBaseUrl}${pathWithoutDuplicateApi}`;
};

const parseResponseBody = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json().catch(() => null);
  }

  const text = await response.text().catch(() => '');
  return text || null;
};

const getErrorMessage = (payload: unknown, status: number) => {
  if (typeof payload === 'object' && payload !== null) {
    if ('error' in payload && typeof payload.error === 'string') {
      return payload.error;
    }

    if ('message' in payload && typeof payload.message === 'string') {
      return payload.message;
    }
  }

  return `Request failed with status ${status}`;
};

const isRetryableStatus = (status: number) =>
  [408, 425, 429, 500, 502, 503, 504].includes(status);

export type ApiClientOptions = RequestInit & {
  auth?: boolean;
};

export async function fetchJson<T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { auth, headers: initHeaders, ...init } = options;
  const headers = new Headers(initHeaders);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = await tokenStorage.get();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers,
  });
  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiRequestError(getErrorMessage(payload, response.status), response.status, payload);
  }

  return payload as T;
}

export async function fetchJsonWithRetry<T>(
  path: string,
  options: ApiClientOptions = {},
  retryOptions?: {
    attempts?: number;
    initialDelayMs?: number;
  },
): Promise<T> {
  const attempts = Math.max(1, retryOptions?.attempts ?? 4);
  const initialDelayMs = Math.max(0, retryOptions?.initialDelayMs ?? 400);

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetchJson<T>(path, options);
    } catch (error) {
      const canRetry =
        error instanceof ApiRequestError ? isRetryableStatus(error.status) : true;

      if (!canRetry || attempt === attempts) {
        throw error;
      }

      await sleep(initialDelayMs * attempt);
    }
  }

  throw new Error('Request failed.');
}
