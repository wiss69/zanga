import { NextRequest } from 'next/server';
import { fetchJson } from '@/src/lib/api-clients/http-client';
import { getCache } from '@/src/lib/cache/kv';
import { env } from '@/src/lib/utils/env';
import { cacheKeys } from '@/src/lib/utils/cache-keys';
import { getClientIp } from '@/src/lib/utils/request';
import { rateLimit } from '@/src/lib/utils/rate-limit';
import { failure, success } from '@/src/lib/utils/responses';
import { logApi } from '@/src/lib/utils/logger';

const cache = getCache();
const TTL = 7 * 24 * 60 * 60 * 1000;

function normalizeCountry(entry: any) {
  return {
    code: entry?.cca2 ?? '',
    name: entry?.translations?.fra?.common ?? entry?.name?.common ?? 'Inconnu',
    region: entry?.region ?? 'N/A',
    capital: Array.isArray(entry?.capital) ? entry.capital[0] : undefined,
    languages: entry?.languages ? Object.values(entry.languages) : [],
    currencies: entry?.currencies
      ? Object.entries(entry.currencies).map(([code, meta]: any) => ({
          code,
          name: meta?.name ?? code,
          symbol: meta?.symbol
        }))
      : [],
    vat: entry?.vatRates?.standard
  };
}

export async function GET(request: NextRequest) {
  const started = Date.now();
  const ip = getClientIp(request);
  const { allowed, retryAfter } = rateLimit(`countries:${ip}`);
  if (!allowed) {
    const response = failure('Quota dépassé', 'RATE_LIMITED', 429);
    response.headers.set('Retry-After', retryAfter?.toString() ?? '60');
    response.headers.set('Cache-Control', 'no-store');
    logApi({ method: 'GET', path: '/api/countries', ms: Date.now() - started, status: 429, code: 'RATE_LIMITED' });
    return response;
  }

  const cached = await cache.get(cacheKeys.countries);
  if (cached) {
    const response = success(JSON.parse(cached));
    response.headers.set('Cache-Control', 'public, max-age=604800');
    logApi({ method: 'GET', path: '/api/countries', ms: Date.now() - started, status: 200 });
    return response;
  }

  const result = await fetchJson(env.restCountriesUrl);
  if (!result.ok) {
    const response = failure('Impossible de récupérer les pays', result.code, result.status);
    response.headers.set('Cache-Control', 'no-store');
    logApi({ method: 'GET', path: '/api/countries', ms: Date.now() - started, status: result.status, code: result.code });
    return response;
  }

  const countries = Array.isArray(result.data) ? result.data.map(normalizeCountry) : [];
  await cache.set(cacheKeys.countries, JSON.stringify(countries), { ttl: TTL });
  const response = success(countries);
  response.headers.set('Cache-Control', 'public, max-age=604800');
  logApi({ method: 'GET', path: '/api/countries', ms: Date.now() - started, status: 200, upstream: 'REST_COUNTRIES' });
  return response;
}
