import Constants from 'expo-constants';

import type { ApiError, ApiSuccess } from '@/contracts';

import {
  clientCacheGet,
  clientCacheSet,
  invalidateAfterMutation,
} from './cache';
import { getApiToken } from './session';

function resolveBaseUrl(): string {
  const fromEnv =
    typeof process !== 'undefined'
      ? process.env.EXPO_PUBLIC_API_URL
      : undefined;
  const fromExtra = (
    Constants.expoConfig?.extra as { apiUrl?: string } | undefined
  )?.apiUrl;
  return fromEnv || fromExtra || 'http://127.0.0.1:8787';
}

export const API_BASE_URL = resolveBaseUrl();

const IS_DEV =
  typeof __DEV__ !== 'undefined'
    ? __DEV__
    : process.env.NODE_ENV !== 'production';

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  mockUserHeader?: string | null;
  signal?: AbortSignal;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Skip GET cache read/write */
  skipCache?: boolean;
  /** Optional Idempotency-Key (POST creates; uuid recommended) */
  idempotencyKey?: string | null;
};

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const base = API_BASE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(base + p);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

function debugLog(
  phase: 'req' | 'res' | 'err' | 'cache',
  payload: Record<string, unknown>
): void {
  if (!IS_DEV) return;
  // eslint-disable-next-line no-console
  console.log(`[api:${phase}]`, JSON.stringify(payload));
}

export async function apiRequest<T>(
  path: string,
  opts: RequestOptions = {}
): Promise<ApiSuccess<T>> {
  const method = (opts.method ?? (opts.body !== undefined ? 'POST' : 'GET')).toUpperCase();
  const url = buildUrl(path, opts.query);
  const token = opts.token !== undefined ? opts.token : getApiToken();

  if (method === 'GET' && !opts.skipCache) {
    const cached = clientCacheGet<ApiSuccess<T>>(method, url);
    if (cached) {
      debugLog('cache', { method, path, url, hit: true });
      return cached;
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.mockUserHeader) headers['X-Mock-User'] = opts.mockUserHeader;
  if (opts.idempotencyKey) headers['Idempotency-Key'] = opts.idempotencyKey;

  debugLog('req', { method, path, url, hasToken: Boolean(token) });
  const started = Date.now();

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });
  } catch (e) {
    debugLog('err', {
      method,
      path,
      message: e instanceof Error ? e.message : 'network error',
    });
    throw e;
  }

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  const durationMs = Date.now() - started;

  if (!res.ok) {
    const err = json as ApiError | null;
    debugLog('err', {
      method,
      path,
      status: res.status,
      durationMs,
      code: err?.error?.code,
    });
    throw new ApiClientError(
      res.status,
      err?.error?.code ?? 'HTTP_ERROR',
      err?.error?.message ?? `Request failed (${res.status})`,
      err?.error?.details
    );
  }

  const success = json as ApiSuccess<T>;
  const apiVersion = res.headers.get('X-API-Version');
  debugLog('res', {
    method,
    path,
    status: res.status,
    durationMs,
    requestId: success?.meta?.requestId,
    ...(apiVersion ? { apiVersion } : {}),
  });

  if (method === 'GET' && !opts.skipCache) {
    clientCacheSet(method, url, success);
  } else if (method !== 'GET') {
    invalidateAfterMutation(path);
  }

  return success;
}

/** Convenience wrappers */
export const apiGet = <T>(path: string, opts?: RequestOptions) =>
  apiRequest<T>(path, { ...opts, method: 'GET' });

export const apiPost = <T>(path: string, body?: unknown, opts?: RequestOptions) =>
  apiRequest<T>(path, { ...opts, method: 'POST', body });

export const apiPut = <T>(path: string, body?: unknown, opts?: RequestOptions) =>
  apiRequest<T>(path, { ...opts, method: 'PUT', body });

export const apiPatch = <T>(path: string, body?: unknown, opts?: RequestOptions) =>
  apiRequest<T>(path, { ...opts, method: 'PATCH', body });

export const apiDelete = <T>(path: string, opts?: RequestOptions) =>
  apiRequest<T>(path, { ...opts, method: 'DELETE' });
