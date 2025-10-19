import { NextRequest } from 'next/server';
import { z } from 'zod';
import { fetchJson } from '@/src/lib/api-clients/http-client';
import { getCache } from '@/src/lib/cache/kv';
import { cacheKeys } from '@/src/lib/utils/cache-keys';
import { env } from '@/src/lib/utils/env';
import { getClientIp } from '@/src/lib/utils/request';
import { rateLimit } from '@/src/lib/utils/rate-limit';
import { failure, success } from '@/src/lib/utils/responses';
import { logApi } from '@/src/lib/utils/logger';

const schema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
  city: z.string().trim().min(2).optional()
});

const cache = getCache();

function buildUrl({ lat, lon, city }: { lat?: number; lon?: number; city?: string }) {
  const url = new URL(env.openMeteoUrl);
  url.searchParams.set('current_weather', 'true');
  url.searchParams.set('hourly', 'temperature_2m,wind_speed_10m');
  if (lat !== undefined && lon !== undefined) {
    url.searchParams.set('latitude', lat.toString());
    url.searchParams.set('longitude', lon.toString());
  }
  if (city) {
    url.searchParams.set('city', city);
  }
  return url.toString();
}

function normalizeWeather(data: any) {
  const current = data?.current_weather ?? {};
  return {
    location: data?.timezone ?? 'Inconnu',
    temperature: current?.temperature ?? null,
    condition: current?.weathercode ?? null,
    windSpeed: current?.windspeed ?? null,
    updatedAt: current?.time ?? new Date().toISOString()
  };
}

export async function GET(request: NextRequest) {
  const started = Date.now();
  const ip = getClientIp(request);
  const { allowed, retryAfter } = rateLimit(`weather:${ip}`);
  if (!allowed) {
    const response = failure('Quota dépassé', 'RATE_LIMITED', 429);
    response.headers.set('Retry-After', retryAfter?.toString() ?? '60');
    response.headers.set('Cache-Control', 'no-store');
    logApi({ method: 'GET', path: '/api/weather', ms: Date.now() - started, status: 429, code: 'RATE_LIMITED' });
    return response;
  }

  const parseResult = schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parseResult.success) {
    const response = failure('Paramètres invalides', 'BAD_REQUEST', 400, parseResult.error.flatten());
    response.headers.set('Cache-Control', 'no-store');
    logApi({ method: 'GET', path: '/api/weather', ms: Date.now() - started, status: 400, code: 'BAD_REQUEST' });
    return response;
  }

  const { lat, lon, city } = parseResult.data;
  const cacheKey = cacheKeys.weather(`${lat ?? ''}:${lon ?? ''}:${city ?? ''}`);
  const cached = await cache.get(cacheKey);
  if (cached) {
    const response = success(JSON.parse(cached));
    response.headers.set('Cache-Control', 'public, max-age=1800');
    logApi({ method: 'GET', path: '/api/weather', ms: Date.now() - started, status: 200 });
    return response;
  }

  const url = buildUrl({ lat, lon, city });
  const result = await fetchJson(url);
  if (!result.ok) {
    const response = failure('Impossible de récupérer la météo', result.code, result.status);
    response.headers.set('Cache-Control', 'no-store');
    logApi({ method: 'GET', path: '/api/weather', ms: Date.now() - started, status: result.status, code: result.code });
    return response;
  }

  const normalized = normalizeWeather(result.data);
  await cache.set(cacheKey, JSON.stringify(normalized), { ttl: 30 * 60 * 1000 });
  const response = success(normalized);
  response.headers.set('Cache-Control', 'public, max-age=1800');
  logApi({ method: 'GET', path: '/api/weather', ms: Date.now() - started, status: 200, upstream: 'OPEN_METEO' });
  return response;
}
