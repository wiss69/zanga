import type { NextRequest } from 'next/server';

export function getClientIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function buildCacheControl(noStore = false, maxAge = 0) {
  if (noStore) {
    return 'no-store';
  }
  return `public, max-age=${Math.floor(maxAge / 1000)}`;
}
