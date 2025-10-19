import { describe, expect, it } from 'vitest';
import { fetchJson } from '@/src/lib/api-clients/http-client';

describe('fetchJson', () => {
  it('returns error when url is invalid', async () => {
    const result = await fetchJson('http://localhost:0', { timeoutMs: 10, retries: 0 });
    expect(result.ok).toBe(false);
  });
});
