const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function fetchJson<T>(path: string) {
  const res = await fetch(`${baseUrl}${path}`, { cache: "no-store" });
  const json = await res.json();
  if (!json.ok) {
    throw new Error(json.error || "API_ERROR");
  }
  return json.data as T;
}

export default async function DashboardPage() {
  const [fx, trade] = await Promise.all([
    fetchJson<{ rates: Record<string, number>; base: string; date: string }>(
      `/api/fx?base=EUR&symbols=USD,GBP`
    ).catch(() => ({ rates: {}, base: "EUR", date: "" } as {
      rates: Record<string, number>;
      base: string;
      date: string;
    })),
    fetchJson<{ totals: { count: number; sum: number } }>(
      `/api/trade?hs=8517&reporter=FR&flow=import&period=2022`
    ).catch(() => ({ totals: { count: 0, sum: 0 } } as { totals: { count: number; sum: number } }))
  ]);

  const indicators = [
    {
      title: "Taux EUR/USD",
      value: fx.rates?.USD ? fx.rates.USD.toFixed(3) : "—",
      caption: fx.date ? `Mise à jour ${fx.date}` : "Dernière valeur inconnue"
    },
    {
      title: "Flux récents (USD)",
      value: Number.isFinite(trade.totals?.sum)
        ? trade.totals.sum.toLocaleString("fr-FR")
        : "—",
      caption: `${trade.totals?.count || 0} enregistrements`
    },
    {
      title: "Favoris",
      value: "3 suivis",
      caption: "Produits épinglés par l'équipe"
    }
  ];

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-brand">Tableau de bord</h1>
        <p className="text-slate-600">
          Suivez vos indicateurs clés : taux de change, produits favoris et volumes d&apos;importation.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {indicators.map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-sm font-medium text-slate-600">{item.title}</h2>
            <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}</p>
            <p className="mt-1 text-xs text-slate-500">{item.caption}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-brand">Activité récente</h2>
        <p className="mt-2 text-sm text-slate-600">
          Connectez vos propres indicateurs (NextAuth + base de données) pour personnaliser ce tableau de bord.
        </p>
      </section>
    </div>
  );
}
