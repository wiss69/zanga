import { z } from "zod";
import { jsonOk, jsonErr, clientIp } from "@/src/lib/api/respond";
import { rateLimit } from "@/src/lib/api/rate-limit";
import { fetchJson } from "@/src/lib/api-clients/http-client";

const Q = z.object({ vat: z.string().trim().min(2).max(20) });

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

  const endpoint = process.env.VIES_URL;
  if (!endpoint) {
    return jsonErr("MISSING_CONFIG", "CONFIG_ERROR", 500);
  }

  const api = `${endpoint}?vat=${encodeURIComponent(parsed.data.vat)}`;
  const response = await fetchJson<unknown>(api, {
    cache: "no-store" as RequestCache
  });
  if (!response.ok) {
    return jsonErr(
      response.error,
      response.code ?? "EXTERNAL_API_DOWN",
      response.status ?? 502
    );
  }
  return jsonOk(response.data);
}
