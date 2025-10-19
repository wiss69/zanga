import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { formatCurrency } from '@/src/lib/utils/format';
import type { CountrySummary, TradeSeries, WeatherInfo } from '@/src/types';

export const dynamic = 'force-dynamic';

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const response = await fetch(`${base}${path}`, { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }
    const payload = await response.json();
    return payload?.data ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getCountry(code: string) {
  const countries = await fetchJson<CountrySummary[]>('/api/countries');
  return countries?.find((country) => country.code.toLowerCase() === code.toLowerCase()) ?? null;
}

async function getTradeHighlights(code: string): Promise<TradeSeries[]> {
  const year = new Date().getFullYear() - 1;
  const params = new URLSearchParams({
    hs: '850760',
    reporter: code.toUpperCase(),
    flow: 'import',
    period: String(year)
  });
  const data = await fetchJson<{ series: TradeSeries[] }>(`/api/trade?${params.toString()}`);
  return data?.series?.slice(0, 5) ?? [];
}

async function getWeather(code: string): Promise<WeatherInfo | null> {
  const data = await fetchJson<WeatherInfo>(`/api/weather?city=${code}`);
  return data;
}

function formatList(values: string[]) {
  if (!values.length) return 'N/A';
  return values.join(', ');
}

export default async function CountryPage({ params }: { params: { code: string } }) {
  const country = await getCountry(params.code);
  if (!country) {
    notFound();
  }

  const [trade, weather] = await Promise.all([getTradeHighlights(country.code), getWeather(country.code)]);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-16">
      <header className="space-y-3">
        <Badge variant="outline" className="text-base">
          {country.code}
        </Badge>
        <h1 className="text-3xl font-bold text-primary">{country.name}</h1>
        <p className="text-slate-600">
          Région : {country.region} · Capitale : {country.capital ?? '—'} · Devise principale :
          {country.currencies[0]?.code ?? 'N/A'}
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <Card className="border-primary/20 md:col-span-2">
          <CardHeader>
            <CardTitle>Informations clés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <p>
              Langues officielles : <span className="font-medium text-slate-800">{formatList(country.languages)}</span>
            </p>
            <p>
              Devise(s) :{' '}
              <span className="font-medium text-slate-800">
                {country.currencies.map((currency) => `${currency.name} (${currency.code})`).join(', ')}
              </span>
            </p>
            <p>TVA indicative : {country.vat ? `${country.vat}%` : 'N/A'}</p>
            <p className="text-xs text-slate-400">
              Données issues de REST Countries et enrichies par les équipes Zinga.
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Météo portuaire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            {weather ? (
              <>
                <p className="text-lg font-semibold text-slate-800">{weather.location}</p>
                <p>Température : {weather.temperature ?? '—'}°C</p>
                <p>Vent : {weather.windSpeed ?? '—'} km/h</p>
                <p className="text-xs text-slate-400">Mis à jour : {weather.updatedAt}</p>
              </>
            ) : (
              <p className="text-slate-500">Données météo indisponibles pour le moment.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Tendances commerciales récentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            {trade.length ? (
              trade.map((item) => (
                <div key={`${item.period}-${item.partner}-${item.hs}`} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{item.partner}</span>
                    <span className="text-primary">{formatCurrency(item.value)}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Flux : {item.flow} · Période : {item.period} · Code HS : {item.hs}
                  </p>
                </div>
              ))
            ) : (
              <p>Aucune donnée commerciale récente n’a été trouvée.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
