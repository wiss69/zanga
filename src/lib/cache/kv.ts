type Entry = { v: unknown; exp: number };
const mem = new Map<string, Entry>();

export async function kvGet<T = unknown>(key: string): Promise<T | null> {
  const hit = mem.get(key);
  if (!hit) return null;
  if (Date.now() > hit.exp) {
    mem.delete(key);
    return null;
  }
  return hit.v as T;
}

export async function kvSet(key: string, value: unknown, ttlMs: number) {
  mem.set(key, { v: value, exp: Date.now() + ttlMs });
}
