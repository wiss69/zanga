export function jsonOk<T>(data: T, init: ResponseInit = {}) {
  return Response.json({ ok: true, data }, { status: 200, ...init });
}

export function jsonErr(
  error: string,
  code: string,
  status = 400,
  extra?: Record<string, unknown>
) {
  return Response.json(
    { ok: false, error, code, status, ...(extra || {}) },
    { status }
  );
}

export function clientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  );
}
