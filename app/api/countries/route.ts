import { jsonOk, jsonErr } from "@/src/lib/api/respond";
import { kvGet, kvSet } from "@/src/lib/cache/kv";
import { fetchJson } from "@/src/lib/api-clients/http-client";

type Country = {
  code: string;
  nom: string;
  devise: string | null;
  langues: string[];
  region: string;
  coords: { lat: number; lng: number } | null;
};

type RestCountry = {
  cca2?: string;
  name?: { common?: string };
  currencies?: Record<string, unknown>;
  languages?: Record<string, string>;
  region?: string;
  latlng?: [number, number];
};

export async function GET() {
  const key = "countries:all";
  const cached = await kvGet<Country[]>(key);
  if (cached) return jsonOk(cached);

  const endpoint = process.env.RESTCOUNTRIES_URL;
  if (!endpoint) {
    return jsonErr("MISSING_CONFIG", "CONFIG_ERROR", 500);
  }

  const response = await fetchJson<unknown>(endpoint, {
    cache: "no-store" as RequestCache
  });
  if (!response.ok) {
    return jsonErr(
      response.error,
      response.code ?? "EXTERNAL_API_DOWN",
      response.status ?? 502
    );
  }

  const rawCountries = Array.isArray(response.data)
    ? (response.data as RestCountry[])
    : [];

  const data: Country[] = rawCountries.map((country) => {
    const lat = Array.isArray(country.latlng) ? country.latlng[0] : null;
    const lng = Array.isArray(country.latlng) ? country.latlng[1] : null;
    const hasCoords = typeof lat === "number" && typeof lng === "number";

    return {
      code: country.cca2 ?? "",
      nom: country.name?.common ?? "",
      devise: country.currencies ? Object.keys(country.currencies)[0] || null : null,
      langues: country.languages ? Object.values(country.languages) : [],
      region: country.region ?? "",
      coords: hasCoords ? { lat, lng } : null
    } satisfies Country;
  });
  await kvSet(key, data, 7 * 24 * 60 * 60 * 1000);
  return jsonOk(data);
}
