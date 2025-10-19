import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';

const trendingProducts = [
  {
    name: 'Accessoires solaires portables',
    growth: '+18% YoY',
    topCountries: ['DE', 'FR', 'ES'],
    hs: '850760'
  },
  {
    name: 'Cosmétiques naturels bio',
    growth: '+12% YoY',
    topCountries: ['FR', 'IT', 'NL'],
    hs: '330499'
  },
  {
    name: 'Pièces vélo cargo',
    growth: '+26% YoY',
    topCountries: ['DK', 'BE', 'DE'],
    hs: '871499'
  }
];

const topByCountry = [
  {
    country: 'France',
    products: ['Électroménager éco', 'Nutrition sportive', 'Textile premium']
  },
  {
    country: 'Allemagne',
    products: ['Mobilité électrique', 'Composants industriels', 'Maison connectée']
  },
  {
    country: 'Italie',
    products: ['Design intérieur', 'Agroalimentaire bio', 'Mode durable']
  }
];

export default function DiscoverPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-16">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-primary">Découvrir des produits à potentiel</h1>
        <p className="text-slate-600">
          Croisez les données d’import/export avec les tendances marché pour prioriser vos prochaines gammes.
        </p>
        <form className="flex flex-col gap-3 md:flex-row">
          <Input placeholder="Nom de produit ou code HS" name="query" />
          <Button type="submit">Analyser</Button>
        </form>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Tendances import/export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm text-slate-600">
            <p>
              Visualisez l’évolution des flux commerciaux et identifiez les opportunités en croissance. Les données sont issues
              de l’API UN Comtrade et enrichies par l’équipe Zinga.
            </p>
            <div className="space-y-4">
              {trendingProducts.map((item) => (
                <div key={item.name} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">{item.name}</h3>
                      <p className="text-xs uppercase tracking-wide text-slate-400">HS {item.hs}</p>
                    </div>
                    <Badge>{item.growth}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Top pays importateurs : {item.topCountries.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Top produits par pays</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            {topByCountry.map((entry) => (
              <div key={entry.country} className="rounded-lg bg-white p-4 shadow-sm">
                <h3 className="text-base font-semibold text-primary">{entry.country}</h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {entry.products.map((product) => (
                    <li key={product}>• {product}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
