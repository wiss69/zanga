"use client";

import { useMemo, useState } from "react";
import { Download, Plane } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { formatNumber } from "@/src/lib/utils";

type SimulationResult = {
  rate?: number;
  converted?: number;
  taricLink?: string;
};

const transportOptions = [
  { label: "Aérien", value: "air", coef: 0.08 },
  { label: "Maritime", value: "sea", coef: 0.04 },
  { label: "Routier", value: "road", coef: 0.06 }
];

export default function SimulatorPage() {
  const [origin, setOrigin] = useState("CN");
  const [destination, setDestination] = useState("FR");
  const [currency, setCurrency] = useState("EUR");
  const [value, setValue] = useState(5000);
  const [hs, setHs] = useState("851712");
  const [transport, setTransport] = useState("sea");
  const [result, setResult] = useState<SimulationResult>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transportCost = useMemo(() => {
    const coef = transportOptions.find((t) => t.value === transport)?.coef ?? 0;
    return value * coef;
  }, [transport, value]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const [fxRes, taricRes] = await Promise.all([
        fetch(`/api/fx?base=${currency}&symbols=USD`).then((r) => r.json()),
        fetch(`/api/taric-link?code=${encodeURIComponent(hs)}`).then((r) => r.json())
      ]);
      if (!fxRes.ok) throw new Error(fxRes.error || "Erreur taux de change");
      if (!taricRes.ok) throw new Error(taricRes.error || "Erreur TARIC");
      const rate = fxRes.data.rates?.USD ?? 1;
      setResult({
        rate,
        converted: value * rate,
        taricLink: (taricRes.data as { link?: string }).link
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inattendue";
      setError(message);
      setResult({});
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Origine", origin],
      ["Destination", destination],
      ["Devise", currency],
      ["Valeur déclarée", value.toString()],
      ["Coût transport estimé", transportCost.toFixed(2)],
      ["Taux USD", result.rate?.toString() ?? ""],
      ["Valeur USD", result.converted?.toFixed(2) ?? ""],
      ["Lien TARIC", result.taricLink ?? ""]
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "simulation.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-brand">Simuler vos coûts</h1>
        <p className="text-slate-600">
          Combinez taux de change, droits potentiels et frais de transport pour estimer votre prix rendu.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2"
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="origin">
            Pays d&apos;origine
          </label>
          <input
            id="origin"
            value={origin}
            onChange={(event) => setOrigin(event.target.value.toUpperCase())}
            className="rounded-md border border-slate-300 px-3 py-2 uppercase focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="destination">
            Pays de destination
          </label>
          <input
            id="destination"
            value={destination}
            onChange={(event) => setDestination(event.target.value.toUpperCase())}
            className="rounded-md border border-slate-300 px-3 py-2 uppercase focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="currency">
            Devise de départ
          </label>
          <input
            id="currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value.toUpperCase())}
            className="rounded-md border border-slate-300 px-3 py-2 uppercase focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="value">
            Valeur déclarée
          </label>
          <input
            id="value"
            type="number"
            value={value}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              setValue(Number.isFinite(nextValue) ? nextValue : 0);
            }}
            className="rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
            min={0}
            step={100}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="hs">
            Code HS
          </label>
          <input
            id="hs"
            value={hs}
            onChange={(event) => setHs(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="transport">
            Mode de transport
          </label>
          <select
            id="transport"
            value={transport}
            onChange={(event) => setTransport(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
          >
            {transportOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-3">
          <Button type="submit" disabled={loading}>
            <Plane className="mr-2 h-4 w-4" /> Calculer
          </Button>
          <Button type="button" variant="outline" onClick={exportCsv} disabled={!result.rate}>
            <Download className="mr-2 h-4 w-4" /> Exporter CSV
          </Button>
        </div>
        {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}
      </form>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          <h2 className="mb-2 text-base font-semibold text-brand">Taux USD</h2>
          <p className="text-2xl font-bold text-slate-900">
            {result.rate ? formatNumber(result.rate) : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          <h2 className="mb-2 text-base font-semibold text-brand">Valeur convertie (USD)</h2>
          <p className="text-2xl font-bold text-slate-900">
            {result.converted ? formatNumber(result.converted) : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          <h2 className="mb-2 text-base font-semibold text-brand">Frais transport estimés</h2>
          <p className="text-2xl font-bold text-slate-900">{formatNumber(transportCost)} {currency}</p>
        </div>
      </section>

      {result.taricLink && (
        <a
          href={result.taricLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-brand underline underline-offset-2"
        >
          Consulter le détail TARIC
        </a>
      )}
    </div>
  );
}
