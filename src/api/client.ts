import { env } from '@/lib/env';

import { sanitizeApiPayload } from './compat';

/**
 * Tokens live in memory only. Every launch trades Telegram's signed launch data for a fresh pair, so nothing
 * that grants access is ever written to the webview's storage.
 */
let access = '';
let refresh = '';
let reauthenticate: (() => Promise<boolean>) | null = null;

export function setTokens(tokens: { access: string; refresh: string } | null): void {
  access = tokens?.access ?? '';
  refresh = tokens?.refresh ?? '';
}

export const hasSession = () => Boolean(access);

/** Called when both tokens are spent; the session layer signs in again with the launch data. */
export function onReauthenticate(handler: () => Promise<boolean>): void {
  reauthenticate = handler;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly detail: string,
    readonly errors: Record<string, unknown> = {},
  ) {
    super(detail);
    this.name = 'ApiError';
  }

  /** The first field error, else the general detail: what to show the user. */
  get text(): string {
    const first = Object.values(this.errors)[0];
    if (typeof first === 'string' && first) return first;
    if (Array.isArray(first) && typeof first[0] === 'string') return first[0];
    return this.detail;
  }
}

export function errorText(error: unknown, fallback = 'خطایی رخ داد. دوباره تلاش کنید.'): string {
  return error instanceof ApiError && error.text ? error.text : fallback;
}

type Query = Record<string, string | number | boolean | null | undefined | (string | number)[]>;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Query;
  auth?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${env.apiUrl}/${path.replace(/^\//, '')}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) value.forEach(item => url.searchParams.append(key, String(item)));
    else url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function send(path: string, options: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Language': 'fa',
    // Payments started here return to the Mini App instead of the website.
    'X-Titan-Client': 'telegram',
    ...options.headers,
  };
  if (options.auth !== false && access) headers.Authorization = `Bearer ${access}`;
  let body: BodyInit | undefined;
  if (options.body instanceof FormData) body = options.body;
  else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }
  return fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body,
    cache: 'no-store',
    credentials: 'omit',
    signal: options.signal,
  });
}

let renewing: Promise<boolean> | null = null;

/** Refresh the access token; if the refresh token is gone too, sign in again. Concurrent callers share one try. */
function renew(): Promise<boolean> {
  renewing ??= (async () => {
    try {
      if (refresh) {
        const response = await send('auth/token/refresh/', { method: 'POST', body: { refresh }, auth: false });
        if (response.ok) {
          const data = (await response.json()) as { access: string; refresh?: string };
          setTokens({ access: data.access, refresh: data.refresh || refresh });
          return true;
        }
      }
      return reauthenticate ? await reauthenticate() : false;
    } catch {
      return false;
    } finally {
      renewing = null;
    }
  })();
  return renewing;
}

async function toError(response: Response): Promise<ApiError> {
  try {
    const payload = await response.json();
    return new ApiError(response.status, payload.code ?? 'error', payload.detail ?? response.statusText, payload.errors);
  } catch {
    return new ApiError(response.status, 'server_error', 'پاسخ نامعتبر از سرور.');
  }
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await send(path, options);
    if (response.status === 401 && options.auth !== false && (await renew())) {
      response = await send(path, options);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(0, 'network_error', 'اتصال برقرار نشد. اینترنت خود را بررسی کنید.');
  }
  if (!response.ok) throw await toError(response);
  if (response.status === 204) return undefined as T;
  return sanitizeApiPayload((await response.json()) as T);
}
