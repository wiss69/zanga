import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCache } from '@/src/lib/cache/kv';
import { cacheKeys } from '@/src/lib/utils/cache-keys';
import { env } from '@/src/lib/utils/env';
import { getClientIp } from '@/src/lib/utils/request';
import { rateLimit } from '@/src/lib/utils/rate-limit';
import { failure, success } from '@/src/lib/utils/responses';
import { logApi } from '@/src/lib/utils/logger';

const schema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^[0-9]{6,10}$/)
});

const cache = getCache();

export async function GET(request: NextRequest) {
  const started = Date.now();
  const ip = getClientIp(request);
  const { allowed, retryAfter } = rateLimit(`taric:${ip}`);
  if (!allowed) {
    const response = failure('Quota dépassé', 'RATE_LIMITED', 429);
    response.headers.set('Retry-After', retryAfter?.toString() ?? '60');
    response.headers.set('Cache-Control', 'no-store');
    logApi({ method: 'GET', path: '/api/taric-link', ms: Date.now() - started, status: 429, code: 'RATE_LIMITED' });
    return response;
  }

  const parseResult = schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parseResult.success) {
    const response = failure('Code TARIC invalide', 'BAD_REQUEST', 400, parseResult.error.flatten());
    response.headers.set('Cache-Control', 'no-store');
    logApi({ method: 'GET', path: '/api/taric-link', ms: Date.now() - started, status: 400, code: 'BAD_REQUEST' });
    return response;
  }

  const { code } = parseResult.data;
  const cacheKey = cacheKeys.taric(code);
  const cached = await cache.get(cacheKey);
  if (cached) {
    const response = success(JSON.parse(cached));
    response.headers.set('Cache-Control', 'public, max-age=604800');
    logApi({ method: 'GET', path: '/api/taric-link', ms: Date.now() - started, status: 200 });
    return response;
  }

  const link = `${env.taricUrl}&Taric=${code}`;
  const payload = { code, link };
  await cache.set(cacheKey, JSON.stringify(payload), { ttl: 7 * 24 * 60 * 60 * 1000 });
  const response = success(payload);
  response.headers.set('Cache-Control', 'public, max-age=604800');
  logApi({ method: 'GET', path: '/api/taric-link', ms: Date.now() - started, status: 200, upstream: 'TARIC' });
  return response;
}
