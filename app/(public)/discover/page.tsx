"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { formatNumber } from "@/src/lib/utils";

type TradeResult = {
  series: Array<{
    reporter: string;
    partner: string;
    flow: string;
    period: string;
    hs: string;
    value: number;
    qty: number | null;
    qtyUnit: string | null;
  }>;
  totals: { count: number; sum: number };
};

export default function DiscoverPage() {
  const [hs, setHs] = useState("8517");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TradeResult | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/trade?hs=${encodeURIComponent(hs)}&reporter=FR&flow=import&period=2022`
      );
      const json = await res.json();
      if (!json.ok) {
        throw new Error(json.error || "Erreur API");
      }
      setData(json.data as TradeResult);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inattendue";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-brand">Découvrir des produits</h1>
        <p className="text-slate-600">
          Interrogez UN Comtrade pour visualiser les flux import/export par code HS et identifier les marchés actifs.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="text-sm font-medium text-slate-700" htmlFor="hs">
          Code HS (2 à 10 chiffres)
        </label>
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            id="hs"
            value={hs}
            onChange={(event) => setHs(event.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
            placeholder="e.g. 851712"
            inputMode="numeric"
            required
          />
          <Button type="submit" disabled={loading} className="md:w-48">
            <Search className="mr-2 h-4 w-4" /> Lancer
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-brand">Résultats récents</h2>
          {loading && <p className="text-sm text-slate-500">Chargement…</p>}
          {!loading && data && (
            <ul className="space-y-3 text-sm">
              {data.series.slice(0, 5).map((item, index) => (
                <li key={`${item.reporter}-${index}`} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">
                      {item.reporter} → {item.partner}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.flow} • {item.period}
                    </p>
                  </div>
                  <span className="font-semibold text-brand">
                    {formatNumber(item.value)} USD
                  </span>
                </li>
              ))}
              {data.series.length === 0 && (
                <li className="text-sm text-slate-500">Aucune donnée disponible.</li>
              )}
            </ul>
          )}
          {!loading && !data && (
            <p className="text-sm text-slate-500">
              Lancez une recherche pour afficher les tendances import/export.
            </p>
          )}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-brand">Top partenaires (exemple)</h2>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>Chine — produits électroniques grand public</li>
            <li>Vietnam — composants et assemblages</li>
            <li>Allemagne — machines spécialisées</li>
            <li>Espagne — accessoires et pièces détachées</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
