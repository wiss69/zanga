import { z } from "zod";
import { jsonOk, jsonErr, clientIp } from "@/src/lib/api/respond";
import { rateLimit } from "@/src/lib/api/rate-limit";
import { fetchJson } from "@/src/lib/api-clients/http-client";

const Body = z.object({
  vat: z
    .string()
    .regex(/^[A-Z]{2}[A-Z0-9]+$/i, "Format VAT UE invalide")
});

export async function POST(req: Request) {
  const rl = rateLimit(clientIp(req));
  if (!rl.allowed) {
    return jsonErr("RATE_LIMITED", "RATE_LIMITED", 429, {
      retryAfter: rl.retryAfter
    });
  }
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonErr("INVALID_JSON", "VALIDATION_ERROR", 400);
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return jsonErr("VALIDATION_ERROR", "VALIDATION_ERROR", 400, {
      details: parsed.error.flatten()
    });
  }

  const endpoint = process.env.VIES_URL;
  if (!endpoint) {
    return jsonErr("MISSING_CONFIG", "CONFIG_ERROR", 500);
  }

  const response = await fetchJson<unknown>(endpoint, {
    method: "POST",
    body: JSON.stringify({ vat: parsed.data.vat }),
    headers: { "Content-Type": "application/json" },
    cache: "no-store" as RequestCache
  });
  if (!response.ok) {
    return jsonErr(
      response.error,
      response.code ?? "EXTERNAL_API_DOWN",
      response.status ?? 502
    );
  }
  const details = response.data as { valid?: boolean } | undefined;
  return jsonOk({ valid: Boolean(details?.valid), details });
}
