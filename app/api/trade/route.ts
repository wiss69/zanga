import { NextRequest } from 'next/server';
import { z } from 'zod';
import crypto from 'node:crypto';
import { fetchJson } from '@/src/lib/api-clients/http-client';
import { getCache } from '@/src/lib/cache/kv';
import { cacheKeys } from '@/src/lib/utils/cache-keys';
import { env } from '@/src/lib/utils/env';
import { getClientIp } from '@/src/lib/utils/request';
import { rateLimit } from '@/src/lib/utils/rate-limit';
import { failure, success } from '@/src/lib/utils/responses';
import { logApi } from '@/src/lib/utils/logger';

const schema = z.object({
  hs: z
    .string()
    .min(2)
    .max(10),
  reporter: z
    .string()
    .min(2)
    .max(10)
    .default('all'),
  partner: z.string().min(2).max(10).optional(),
  flow: z.enum(['import', 'export']).default('import'),
  period: z.string().regex(/^[0-9]{4}(0[1-9]|1[0-2])?$/),
  page: z.coerce.number().int().min(1).max(100).optional()
});

const cache = getCache();

function hashParams(params: Record<string, unknown>) {
  return crypto.createHash('sha256').update(JSON.stringify(params)).digest('hex');
}

function buildEndpointUrl(params: Record<string, unknown>) {
  const url = new URL('https://comtradedeveloper.un.org/api/get');
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

function normalizeComtrade(data: any) {
  const dataset = Array.isArray(data?.dataset) ? data.dataset : [];
  const series = dataset.map((entry: any) => ({
    reporter: entry.rtTitle ?? entry.rtCode,
    partner: entry.ptTitle ?? entry.ptCode,
    flow: (entry.flowCode === 2 ? 'export' : 'import') as 'import' | 'export',
    period: String(entry.period ?? ''),
    hs: entry.cmdCode ?? '',
    value: Number(entry.TradeValue) || 0,
    qty: entry.Qty ? Number(entry.Qty) : undefined
  }));
  const totalValue = series.reduce((sum, item) => sum + item.value, 0);
  const totalQty = series.every((item) => typeof item.qty === 'number')
    ? series.reduce((sum, item) => sum + (item.qty ?? 0), 0)
    : undefined;

  return {
    series,
    totals: {
      value: totalValue,
      qty: totalQty
    }
  };
}

async function callComtrade(url: string, key: string | undefined) {
  return fetchJson(url, {
    headers: key
      ? {
          'x-comtrade-key': key
        }
      : undefined
  });
}

async function fetchTrade(params: Record<string, unknown>) {
  const url = buildEndpointUrl({
    type: 'C',
    freq: 'A',
    cl: 'HS',
    fmt: 'json',
    ps: 20,
    ...params
  });

  const primaryKey = env.comtradePrimaryKey;
  const secondaryKey = env.comtradeSecondaryKey;

  const first = await callComtrade(url, primaryKey);
  if (first.ok) {
    return { result: first, upstream: 'COMTRADE_PRIMARY' } as const;
  }

  if (first.status === 401 || first.status === 429 || first.status >= 500) {
    const second = await callComtrade(url, secondaryKey);
    if (second.ok) {
      return { result: second, upstream: 'COMTRADE_SECONDARY' } as const;
    }
    return { result: second, upstream: 'COMTRADE_SECONDARY' } as const;
  }

  return { result: first, upstream: 'COMTRADE_PRIMARY' } as const;
}

function ttlForPeriod(period: string) {
  const nowYear = Number(new Date().getFullYear());
  const year = Number(period.slice(0, 4));
  return year < nowYear ? 6 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
}

async function handleRequest(request: NextRequest, params: Record<string, unknown>) {
  const started = Date.now();
  const ip = getClientIp(request);
  const { allowed, retryAfter } = rateLimit(`trade:${ip}`);
  if (!allowed) {
    const response = failure('Quota dépassé', 'RATE_LIMITED', 429);
    response.headers.set('Retry-After', retryAfter?.toString() ?? '60');
    response.headers.set('Cache-Control', 'no-store');
    logApi({ method: request.method, path: '/api/trade', ms: Date.now() - started, status: 429, code: 'RATE_LIMITED' });
    return response;
  }

  const parseResult = schema.safeParse(params);
  if (!parseResult.success) {
    const response = failure('Paramètres invalides', 'BAD_REQUEST', 400, parseResult.error.flatten());
    response.headers.set('Cache-Control', 'no-store');
    logApi({ method: request.method, path: '/api/trade', ms: Date.now() - started, status: 400, code: 'BAD_REQUEST' });
    return response;
  }

  const validated = parseResult.data;
  const cacheKey = cacheKeys.trade(hashParams(validated));
  const maxAge = Math.floor(ttlForPeriod(validated.period) / 1000);
  const cached = await cache.get(cacheKey);
  if (cached) {
    const response = success(JSON.parse(cached));
    response.headers.set('Cache-Control', `public, max-age=${maxAge}`);
    logApi({ method: request.method, path: '/api/trade', ms: Date.now() - started, status: 200 });
    return response;
  }

  const { result, upstream } = await fetchTrade(validated);
  if (!result.ok) {
    const code = result.code ?? 'UPSTREAM_ERROR';
    const status = result.status ?? 502;
    if (code === 'NETWORK_ERROR') {
      const response = failure('Service Comtrade indisponible', 'EXTERNAL_API_DOWN', 503);
      response.headers.set('Cache-Control', 'no-store');
      logApi({ method: request.method, path: '/api/trade', ms: Date.now() - started, status: 503, code: 'EXTERNAL_API_DOWN', upstream });
      return response;
    }
    const response = failure('Erreur lors de la récupération des données Comtrade', code, status);
    response.headers.set('Cache-Control', 'no-store');
    logApi({ method: request.method, path: '/api/trade', ms: Date.now() - started, status, code, upstream });
    return response;
  }

  const normalized = normalizeComtrade(result.data);
  const ttl = ttlForPeriod(validated.period);
  await cache.set(cacheKey, JSON.stringify(normalized), { ttl });
  const response = success(normalized);
  response.headers.set('Cache-Control', `public, max-age=${Math.floor(ttl / 1000)}`);
  logApi({ method: request.method, path: '/api/trade', ms: Date.now() - started, status: 200, upstream });
  return response;
}

export async function GET(request: NextRequest) {
  return handleRequest(request, Object.fromEntries(request.nextUrl.searchParams));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  return handleRequest(request, body ?? {});
}
