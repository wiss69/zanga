import { z } from "zod";
import { jsonOk, jsonErr, clientIp } from "@/src/lib/api/respond";
import { rateLimit } from "@/src/lib/api/rate-limit";
import { kvGet, kvSet } from "@/src/lib/cache/kv";

const Q = z.object({
  code: z.string().regex(/^[0-9]{6,10}$/i, "Code HS/TARIC 6–10 chiffres")
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

  const endpoint = process.env.TARIC_URL;
  if (!endpoint) {
    return jsonErr("MISSING_CONFIG", "CONFIG_ERROR", 500);
  }

  const key = `taric:${parsed.data.code}`;
  const cached = await kvGet(key);
  if (cached) return jsonOk(cached);

  const link = `${endpoint}&Taric=1&Lang=en&SimDate=20250101&GoodsNomenclature=${parsed.data.code}`;
  await kvSet(key, { link }, 7 * 24 * 60 * 60 * 1000);
  return jsonOk({ link });
}
