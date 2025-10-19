import { NextRequest } from 'next/server';
import { z } from 'zod';
import { fetchJson } from '@/src/lib/api-clients/http-client';
import { getCache } from '@/src/lib/cache/kv';
import { env } from '@/src/lib/utils/env';
import { cacheKeys } from '@/src/lib/utils/cache-keys';
import { getClientIp } from '@/src/lib/utils/request';
import { rateLimit } from '@/src/lib/utils/rate-limit';
import { failure, success } from '@/src/lib/utils/responses';
import { logApi } from '@/src/lib/utils/logger';

const schema = z.object({
  base: z
    .string()
    .trim()
    .toUpperCase()
    .length(3, 'Devise de base invalide'),
  symbols: z
    .string()
    .trim()
    .optional()
});

const cache = getCache();

function normalizeSymbols(symbols?: string | null) {
  return symbols?.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean) ?? [];
}

function parseEcbResponse(data: any) {
  if (!data) return null;
  const rates: Record<string, number> = {};
  const base = 'EUR';
  const observations = data?.dataSets?.[0]?.observations;
  const structure = data?.structure;
  if (observations && structure?.dimensions?.observation) {
    const currencies = structure.dimensions.observation[1]?.values ?? [];
    for (const [key, value] of Object.entries(observations)) {
      const [, currencyIndex] = key.split(':').map(Number);
      const currency = currencies[currencyIndex]?.id;
      const rateValue = Array.isArray(value) ? value[0] : value;
      if (currency && typeof rateValue === 'number') {
        rates[currency] = rateValue;
      }
    }
  }

  if (Object.keys(rates).length > 0) {
    return {
      base,
      date: new Date().toISOString().slice(0, 10),
      rates,
      source: 'ECB' as const
    };
  }

  if (data?.rates) {
    return {
      base: data.base ?? base,
      date: data.date ?? new Date().toISOString().slice(0, 10),
      rates: data.rates,
      source: 'ECB' as const
    };
  }

  return null;
}

function parseExchangeRateHost(data: any, base: string) {
  if (!data?.rates) return null;
  return {
    base,
    date: data.date ?? new Date().toISOString().slice(0, 10),
    rates: data.rates as Record<string, number>,
    source: 'EXCHANGERATE_HOST' as const
  };
}

export async function GET(request: NextRequest) {
  const started = Date.now();
  const ip = getClientIp(request);
  const { allowed, retryAfter } = rateLimit(`fx:${ip}`);
  if (!allowed) {
    const response = failure('Quota dépassé', 'RATE_LIMITED', 429);
    response.headers.set('Retry-After', retryAfter?.toString() ?? '60');
    response.headers.set('Cache-Control', 'no-store');
    logApi({ method: 'GET', path: '/api/fx', ms: Date.now() - started, status: 429, code: 'RATE_LIMITED' });
    return response;
  }

  const parseResult = schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parseResult.success) {
    const response = failure('Paramètres invalides', 'BAD_REQUEST', 400, parseResult.error.flatten());
    response.headers.set('Cache-Control', 'no-store');
    logApi({ method: 'GET', path: '/api/fx', ms: Date.now() - started, status: 400, code: 'BAD_REQUEST' });
    return response;
  }

  const { base, symbols } = parseResult.data;
  const symbolList = normalizeSymbols(symbols);
  const cacheKey = cacheKeys.fx(base);

  const cached = await cache.get(cacheKey);
  if (cached) {
    const data = JSON.parse(cached);
    const filtered = symbolList.length
      ? { ...data, rates: Object.fromEntries(Object.entries(data.rates).filter(([key]) => symbolList.includes(key))) }
      : data;
    const response = success(filtered);
    response.headers.set('Cache-Control', 'public, max-age=86400');
    logApi({ method: 'GET', path: '/api/fx', ms: Date.now() - started, status: 200 });
    return response;
  }

  const ecbResult = await fetchJson(env.ecbUrl);
  if (ecbResult.ok) {
    const fx = parseEcbResponse(ecbResult.data);
    if (fx) {
      await cache.set(cacheKey, JSON.stringify(fx), { ttl: 86_400_000 });
      const filtered = symbolList.length
        ? { ...fx, rates: Object.fromEntries(Object.entries(fx.rates).filter(([key]) => symbolList.includes(key))) }
        : fx;
      const response = success(filtered);
      response.headers.set('Cache-Control', 'public, max-age=86400');
      logApi({ method: 'GET', path: '/api/fx', ms: Date.now() - started, status: 200, upstream: 'ECB' });
      return response;
    }
  }

  const fallbackUrl = new URL(env.exchangeRateUrl);
  fallbackUrl.searchParams.set('base', base);
  if (symbolList.length) {
    fallbackUrl.searchParams.set('symbols', symbolList.join(','));
  }

  const fallbackResult = await fetchJson(fallbackUrl.toString());
  if (fallbackResult.ok) {
    const fx = parseExchangeRateHost(fallbackResult.data, base);
    if (fx) {
      await cache.set(cacheKey, JSON.stringify(fx), { ttl: 3_600_000 });
      const response = success(fx);
      response.headers.set('Cache-Control', 'public, max-age=3600');
      logApi({ method: 'GET', path: '/api/fx', ms: Date.now() - started, status: 200, upstream: 'EXCHANGERATE_HOST' });
      return response;
    }
  }

  const errorCode = ecbResult.ok ? 'UPSTREAM_PARSING_ERROR' : ecbResult.code;
  const status = ecbResult.ok ? 502 : ecbResult.status;
  const response = failure('Impossible de récupérer les taux de change', errorCode, status);
  response.headers.set('Cache-Control', 'no-store');
  logApi({ method: 'GET', path: '/api/fx', ms: Date.now() - started, status, code: errorCode });
  return response;
}
