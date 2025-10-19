import { NextRequest } from 'next/server';
import { z } from 'zod';
import { fetchJson } from '@/src/lib/api-clients/http-client';
import { env } from '@/src/lib/utils/env';
import { getClientIp } from '@/src/lib/utils/request';
import { rateLimit } from '@/src/lib/utils/rate-limit';
import { failure, success } from '@/src/lib/utils/responses';
import { logApi } from '@/src/lib/utils/logger';

const schema = z.object({
  vat: z
    .string()
    .trim()
    .regex(/^[A-Z]{2}[A-Z0-9]+$/, 'TVA invalide'),
  traderName: z.string().trim().optional(),
  traderAddress: z.string().trim().optional()
});

function buildSoapEnvelope({ vat, traderName, traderAddress }: z.infer<typeof schema>) {
  const countryCode = vat.slice(0, 2);
  const vatNumber = vat.slice(2);
  return `<?xml version="1.0" encoding="UTF-8"?>
  <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
    <soap:Header/>
    <soap:Body>
      <urn:checkVatApprox>
        <urn:countryCode>${countryCode}</urn:countryCode>
        <urn:vatNumber>${vatNumber}</urn:vatNumber>
        <urn:traderName>${traderName ?? ''}</urn:traderName>
        <urn:traderAddress>${traderAddress ?? ''}</urn:traderAddress>
      </urn:checkVatApprox>
    </soap:Body>
  </soap:Envelope>`;
}

function parseSoapResponse(xml: string) {
  const valid = /<valid>(true|false)<\/valid>/i.exec(xml)?.[1] === 'true';
  const name = /<traderName>([^<]*)<\/traderName>/.exec(xml)?.[1]?.trim();
  const address = /<traderAddress>([^<]*)<\/traderAddress>/.exec(xml)?.[1]?.trim();
  const requestDate = /<requestDate>([^<]*)<\/requestDate>/.exec(xml)?.[1];
  const traderCompanyType = /<traderCompanyType>([^<]*)<\/traderCompanyType>/.exec(xml)?.[1]?.trim();
  return {
    valid,
    name: name || null,
    address: address || null,
    requestDate: requestDate || null,
    companyType: traderCompanyType || null
  };
}

export async function POST(request: NextRequest) {
  const started = Date.now();
  const ip = getClientIp(request);
  const { allowed, retryAfter } = rateLimit(`vies:${ip}`);
  if (!allowed) {
    const response = failure('Quota dépassé', 'RATE_LIMITED', 429);
    response.headers.set('Retry-After', retryAfter?.toString() ?? '60');
    response.headers.set('Cache-Control', 'no-store');
    logApi({ method: 'POST', path: '/api/vies/validate', ms: Date.now() - started, status: 429, code: 'RATE_LIMITED' });
    return response;
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const response = failure('Paramètres invalides', 'BAD_REQUEST', 400, parsed.error.flatten());
    response.headers.set('Cache-Control', 'no-store');
    logApi({ method: 'POST', path: '/api/vies/validate', ms: Date.now() - started, status: 400, code: 'BAD_REQUEST' });
    return response;
  }

  const envelope = buildSoapEnvelope(parsed.data);
  const result = await fetchJson(env.viesUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml;charset=UTF-8'
    },
    body: envelope,
    parse: 'text',
    timeoutMs: 8_000
  });

  if (!result.ok) {
    const status = result.status ?? 502;
    const code = result.code ?? 'UPSTREAM_ERROR';
    const response = failure('Erreur lors de la vérification VIES', code, status);
    response.headers.set('Cache-Control', 'no-store');
    logApi({ method: 'POST', path: '/api/vies/validate', ms: Date.now() - started, status, code });
    return response;
  }

  const payload = parseSoapResponse(result.data as unknown as string);
  const response = success(payload);
  response.headers.set('Cache-Control', 'no-store');
  logApi({ method: 'POST', path: '/api/vies/validate', ms: Date.now() - started, status: 200, upstream: 'VIES' });
  return response;
}
