import { z } from "zod";
import { jsonOk, jsonErr, clientIp } from "@/src/lib/api/respond";
import { rateLimit } from "@/src/lib/api/rate-limit";
import { kvGet, kvSet } from "@/src/lib/cache/kv";

type Ok<T> = { ok: true; data: T };
type Err = { ok: false; error: string; code: string; status: number };
type Res<T> = Ok<T> | Err;

type ComtradeEntry = {
  rt3ISO?: string;
  rtTitle?: string;
  pt3ISO?: string;
  ptTitle?: string;
  rgCode?: string;
  Period?: string;
  cmdCode?: string;
  TradeValue?: number;
  Qty?: number;
  qtyUnitAbbr?: string;
};

type ComtradeResponse = {
  dataset?: ComtradeEntry[];
};

const Q = z.object({
  hs: z.string().regex(/^[0-9]{2,10}$/i, "HS invalide (2–10 chiffres)"),
  reporter: z.string().toUpperCase().min(2),
  partner: z.string().toUpperCase().min(2).optional(),
  flow: z.enum(["import", "export"]),
  period: z.string().regex(/^\d{4}(\d{2})?$/, "YYYY ou YYYYMM"),
  page: z.coerce.number().min(1).max(50).optional()
});

const TTL_MS = 6 * 60 * 60 * 1000;

export async function GET(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(ip);
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

  const { hs, reporter, partner, flow, period, page = 1 } = parsed.data;
  const key = `trade:${hs}:${reporter}:${partner ?? "ALL"}:${flow}:${period}:p${page}`;
  const cached = await kvGet(key);
  if (cached) return jsonOk(cached);

  const endpoint = "https://comtradedeveloper.un.org/api/get";
  const params = new URLSearchParams({
    type: "C",
    freq: period.length === 6 ? "M" : "A",
    px: "HS",
    ps: period,
    r: reporter,
    p: partner ?? "all",
    rg: flow === "import" ? "1" : "2",
    cc: hs,
    page: String(page),
    fmt: "JSON"
  });

  const primaryKey = process.env.COMTRADE_PRIMARY_KEY ?? "";
  const secondaryKey = process.env.COMTRADE_SECONDARY_KEY ?? "";

  const r1 = await callComtrade(`${endpoint}?${params}`, primaryKey);
  const r = r1.ok ? r1 : await callComtrade(`${endpoint}?${params}`, secondaryKey);
  if (!r.ok) {
    return jsonErr(r.error, r.code ?? "EXTERNAL_API_DOWN", r.status ?? 502);
  }

  const normalized = normalizeComtrade(r.data);
  await kvSet(key, normalized, TTL_MS);
  return jsonOk(normalized);
}

async function callComtrade(url: string, key: string): Promise<Res<ComtradeResponse>> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      headers: { "x-comtrade-key": key },
      signal: controller.signal,
      cache: "no-store"
    });
    const status = res.status;
    const text = await res.text();
    let json: unknown = null;
    try {
      json = text ? (JSON.parse(text) as unknown) : null;
    } catch {}
    if (!res.ok) {
      const code =
        status === 429
          ? "RATE_LIMITED"
          : status >= 500
          ? "UPSTREAM_5XX"
          : "UPSTREAM_BAD_REQUEST";
      const body = (json as Record<string, unknown>) ?? {};
      return {
        ok: false,
        error:
          typeof body.error === "string"
            ? body.error
            : res.statusText || "COMTRADE_ERROR",
        code,
        status
      };
    }
    return { ok: true, data: (json as ComtradeResponse) ?? {} };
  } catch (error: unknown) {
    const aborted =
      typeof error === "object" && error !== null && (error as { name?: string }).name === "AbortError";
    return {
      ok: false,
      error: aborted ? "TIMEOUT" : "NETWORK_ERROR",
      code: aborted ? "TIMEOUT" : "NETWORK",
      status: aborted ? 408 : 500
    };
  } finally {
    clearTimeout(id);
  }
}

function normalizeComtrade(raw: ComtradeResponse) {
  const dataset = Array.isArray(raw?.dataset) ? raw.dataset : [];
  const series = dataset.map((item) => ({
    reporter: item.rt3ISO ?? item.rtTitle ?? "",
    partner: item.pt3ISO ?? item.ptTitle ?? "",
    flow: item.rgCode === "1" ? "import" : "export",
    period: item.Period ?? "",
    hs: item.cmdCode ?? "",
    value: item.TradeValue ?? 0,
    qty: item.Qty ?? null,
    qtyUnit: item.qtyUnitAbbr ?? null
  }));
  const totals = {
    count: series.length,
    sum: series.reduce((sum, entry) => sum + (entry.value ?? 0), 0)
  };
  return { series, totals, source: "UN Comtrade" };
}
