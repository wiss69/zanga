import { notFound } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

type Country = {
  code: string;
  nom: string;
  devise: string | null;
  langues: string[];
  region: string;
  coords: { lat: number; lng: number } | null;
};

type Weather = {
  current?: {
    temperature_2m?: number;
    wind_speed_10m?: number;
  };
};

type Trade = {
  totals: { count: number; sum: number };
};

async function fetchJson<T>(path: string) {
  const res = await fetch(`${baseUrl}${path}`, { cache: "no-store" });
  const json = await res.json();
  if (!json.ok) {
    throw new Error(json.error || "API_ERROR");
  }
  return json.data as T;
}

export default async function CountryPage({ params }: { params: { code: string } }) {
  const countries = await fetchJson<Country[]>("/api/countries");
  const country = countries.find((item) => item.code === params.code.toUpperCase());
  if (!country) {
    notFound();
  }

  const [weather, trade] = await Promise.all([
    country.coords
      ? fetchJson<Weather>(
          `/api/weather?lat=${country.coords.lat}&lon=${country.coords.lng}`
        ).catch(() => ({} as Weather))
      : Promise.resolve({} as Weather),
    fetchJson<Trade>(
      `/api/trade?hs=8517&reporter=${country.code}&flow=import&period=2022`
    ).catch(() => ({ totals: { count: 0, sum: 0 } } as Trade))
  ]);

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-brand">{country.nom}</h1>
        <p className="text-slate-600">
          Région {country.region} — devise principale {country.devise || "N/A"}.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-brand">Langues</h2>
          <p className="mt-2 text-sm text-slate-600">
            {country.langues.length > 0 ? country.langues.join(", ") : "Non renseigné"}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-brand">Météo actuelle</h2>
          {weather?.current ? (
            <div className="mt-2 text-sm text-slate-600">
              <p>Température: {weather.current.temperature_2m ?? "—"} °C</p>
              <p>Vent: {weather.current.wind_speed_10m ?? "—"} km/h</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              Aucune donnée météo disponible pour ce pays.
            </p>
          )}
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-brand">Flux commerciaux récents</h2>
        <p className="mt-2 text-sm text-slate-600">
          Total importations (HS 8517) :
          {" "}
          {Number.isFinite(trade.totals.sum)
            ? trade.totals.sum.toLocaleString("fr-FR")
            : "—"}{" "}
          USD sur {trade.totals.count} enregistrements.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Données UN Comtrade. Ajustez le code HS dans l&apos;API pour approfondir.
        </p>
      </section>
    </div>
  );
}
