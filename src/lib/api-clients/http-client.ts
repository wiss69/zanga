export type HttpError = { ok: false; status: number; error: string; code?: string };
export type HttpOk<T> = { ok: true; data: T; status: number };
export type HttpResult<T> = HttpOk<T> | HttpError;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchJson<T>(
  url: string,
  opts: RequestInit & { timeoutMs?: number; retries?: number } = {}
): Promise<HttpResult<T>> {
  const { timeoutMs = 8000, retries = 2, ...init } = opts;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "User-Agent": "Zinga/1.0",
        ...(init.headers || {})
      },
      signal: controller.signal
    });
    const status = res.status;
    const text = await res.text();
    let json: unknown = null;
    if (text) {
      try {
        json = JSON.parse(text) as unknown;
      } catch {
        json = text;
      }
    }
    if (!res.ok) {
      const shouldRetry = status >= 500 && retries > 0;
      if (shouldRetry) {
        await sleep(200 * (3 - retries));
        return fetchJson<T>(url, { ...opts, retries: retries - 1 });
      }
      const body = (json as Record<string, unknown>) ?? {};
      return {
        ok: false,
        status,
        error:
          typeof body.error === "string" ? body.error : res.statusText || "UPSTREAM_ERROR",
        code: typeof body.code === "string" ? body.code : undefined
      };
    }
    return { ok: true, status, data: json as T };
  } catch (error: unknown) {
    if (retries > 0) {
      await sleep(200 * (3 - retries));
      return fetchJson<T>(url, { ...opts, retries: retries - 1 });
    }
    const aborted =
      typeof error === "object" && error !== null && (error as { name?: string }).name === "AbortError";
    return {
      ok: false,
      status: aborted ? 408 : 500,
      error: aborted ? "TIMEOUT" : "NETWORK_ERROR",
      code: aborted ? "TIMEOUT" : "NETWORK"
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
