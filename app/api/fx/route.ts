import { z } from "zod";
import { jsonOk, jsonErr, clientIp } from "@/src/lib/api/respond";
import { rateLimit } from "@/src/lib/api/rate-limit";
import { kvGet, kvSet } from "@/src/lib/cache/kv";
import { fetchJson } from "@/src/lib/api-clients/http-client";

type FxPayload = {
  base?: string;
  date?: string;
  rates?: Record<string, number>;
};

const Q = z.object({
  base: z.string().toUpperCase().length(3),
  symbols: z.string().optional()
});

export async function GET(req: Request) {
  const rl = rateLimit(clientIp(req));
  if (!rl.allowed) {
    return jsonErr("RATE_LIMITED", "RATE_LIMITED", 429, {
      retryAfter: rl.retryAfter
    });
  }
  const url = new URL(req.url);
  const parsed = Q.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return jsonErr("VALIDATION_ERROR", "VALIDATION_ERROR", 400, {
      details: parsed.error.flatten()
    });
  }
  const { base, symbols } = parsed.data;

  const provider = process.env.EXCHANGERATE_HOST_URL;
  if (!provider) {
    return jsonErr("MISSING_CONFIG", "CONFIG_ERROR", 500);
  }

  const key = `fx:${base}:${symbols || "ALL"}`;
  const cached = await kvGet(key);
  if (cached) return jsonOk(cached);

  const hostUrl = `${provider}?base=${base}${symbols ? `&symbols=${symbols}` : ""}`;

  const response = await fetchJson<FxPayload>(hostUrl, {
    cache: "no-store" as RequestCache
  });
  if (!response.ok) {
    return jsonErr(
      response.error,
      response.code ?? "EXTERNAL_API_DOWN",
      response.status ?? 502
    );
  }

  const payload = response.data ?? {};

  const data = {
    base: payload.base || base,
    date: payload.date,
    rates: payload.rates ?? {}
  };
  await kvSet(key, data, 60 * 60 * 1000);
  return jsonOk(data);
}
