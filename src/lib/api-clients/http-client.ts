export interface ApiSuccess<T> {
  ok: true;
  data: T;
  status: number;
}

export interface ApiFailure {
  ok: false;
  error: string;
  code: string;
  status: number;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface FetchJsonOptions extends RequestInit {
  method?: HttpMethod;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  parse?: 'json' | 'text';
  signal?: AbortSignal;
}

const DEFAULT_TIMEOUT = 8_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY = 500;

const RETRY_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchJson<T = unknown>(
  url: string,
  { timeoutMs = DEFAULT_TIMEOUT, retries = DEFAULT_RETRIES, retryDelayMs = DEFAULT_RETRY_DELAY, parse = 'json', headers, signal, ...init }: FetchJsonOptions = {}
): Promise<ApiResponse<T>> {
  const mergedHeaders = new Headers(headers);
  if (!mergedHeaders.has('User-Agent')) {
    mergedHeaders.set('User-Agent', 'Zinga/1.0 (+https://zinga.io)');
  }
  if (!mergedHeaders.has('Accept')) {
    mergedHeaders.set('Accept', 'application/json');
  }

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let compositeSignal: AbortSignal;

    if (signal) {
      if (typeof AbortSignal.any === 'function') {
        compositeSignal = AbortSignal.any([controller.signal, signal]);
      } else {
        const linked = new AbortController();
        const abort = () => linked.abort();
        controller.signal.addEventListener('abort', abort, { once: true });
        signal.addEventListener('abort', abort, { once: true });
        compositeSignal = linked.signal;
      }
    } else {
      compositeSignal = controller.signal;
    }

    try {
      const response = await fetch(url, {
        ...init,
        method: init.method ?? 'GET',
        headers: mergedHeaders,
        signal: compositeSignal
      });

      clearTimeout(timeout);

      const status = response.status;
      const isJson = response.headers.get('content-type')?.includes('application/json');
      let payload: unknown = null;
      if (parse === 'json' && isJson) {
        payload = await response.json();
      } else if (parse === 'text') {
        payload = await response.text();
      } else if (parse === 'json') {
        try {
          payload = await response.json();
        } catch (error) {
          payload = await response.text();
        }
      }

      if (response.ok) {
        return { ok: true, data: payload as T, status };
      }

      if (RETRY_STATUS.has(status) && attempt < retries) {
        attempt += 1;
        await sleep(retryDelayMs * attempt);
        continue;
      }

      return {
        ok: false,
        error: response.statusText || 'REQUEST_FAILED',
        code: `HTTP_${status}`,
        status,
        details: payload
      };
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt < retries) {
        attempt += 1;
        await sleep(retryDelayMs * attempt);
        continue;
      }
      const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
      return {
        ok: false,
        error: message,
        code: 'NETWORK_ERROR',
        status: 503,
        details: { cause: error instanceof Error ? error.name : undefined }
      };
    }
  }

  const message =
    lastError instanceof Error ? lastError.message : 'Impossible de joindre le service externe.';
  return {
    ok: false,
    error: message,
    code: 'NETWORK_ERROR',
    status: 503
  };
}
