import { z } from "zod";
import { jsonOk, jsonErr, clientIp } from "@/src/lib/api/respond";
import { rateLimit } from "@/src/lib/api/rate-limit";
import { kvGet, kvSet } from "@/src/lib/cache/kv";
import { fetchJson } from "@/src/lib/api-clients/http-client";

const Q = z
  .object({
    ville: z.string().trim().min(2).optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lon: z.coerce.number().min(-180).max(180).optional()
  })
  .refine(
    (value) => value.ville || (value.lat != null && value.lon != null),
    { message: "ville ou lat/lon requis" }
  );

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

  const endpoint = process.env.OPENMETEO_URL;
  if (!endpoint) {
    return jsonErr("MISSING_CONFIG", "CONFIG_ERROR", 500);
  }

  const key = `meteo:${parsed.data.ville || `${parsed.data.lat},${parsed.data.lon}`}`;
  const cached = await kvGet(key);
  if (cached) return jsonOk(cached);

  const query = parsed.data.ville
    ? "latitude=0&longitude=0"
    : `latitude=${parsed.data.lat}&longitude=${parsed.data.lon}`;
  const apiUrl = `${endpoint}?${query}&hourly=temperature_2m,wind_speed_10m&current=temperature_2m,wind_speed_10m`;
  const response = await fetchJson<unknown>(apiUrl, {
    cache: "no-store" as RequestCache
  });
  if (!response.ok) {
    return jsonErr(
      response.error,
      response.code ?? "EXTERNAL_API_DOWN",
      response.status ?? 502
    );
  }

  await kvSet(key, response.data, 30 * 60 * 1000);
  return jsonOk(response.data);
}
