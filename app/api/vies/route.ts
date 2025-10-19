import { NextRequest } from 'next/server';
import { getClientIp } from '@/src/lib/utils/request';
import { rateLimit } from '@/src/lib/utils/rate-limit';
import { failure, success } from '@/src/lib/utils/responses';
import { logApi } from '@/src/lib/utils/logger';

export async function GET(request: NextRequest) {
  const started = Date.now();
  const ip = getClientIp(request);
  const { allowed, retryAfter } = rateLimit(`vies:${ip}`);
  if (!allowed) {
    const response = failure('Quota dépassé', 'RATE_LIMITED', 429);
    response.headers.set('Retry-After', retryAfter?.toString() ?? '60');
    response.headers.set('Cache-Control', 'no-store');
    logApi({ method: 'GET', path: '/api/vies', ms: Date.now() - started, status: 429, code: 'RATE_LIMITED' });
    return response;
  }

  const response = success({ message: 'Utilisez POST /api/vies/validate pour vérifier un numéro de TVA.' });
  response.headers.set('Cache-Control', 'no-store');
  logApi({ method: 'GET', path: '/api/vies', ms: Date.now() - started, status: 200 });
  return response;
}
