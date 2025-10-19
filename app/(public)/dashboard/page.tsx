import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';

const metrics = [
  { label: 'Taux EUR/USD', value: '1,08', trend: '+0,4%', badge: 'FX' },
  { label: 'Alertes conformité', value: '2', trend: 'Nouvelle', badge: 'Alertes' },
  { label: 'Simulations ce mois', value: '14', trend: '+3', badge: 'Simulations' },
  { label: 'Favoris produits', value: '8', trend: '+1', badge: 'Favoris' }
];

const recentSimulations = [
  {
    id: 'SIM-2024-031',
    route: 'CN ➝ FR',
    product: 'Batteries portables',
    total: '18 250 €',
    date: '12/03/2024'
  },
  {
    id: 'SIM-2024-029',
    route: 'VN ➝ DE',
    product: 'Accessoires vélo',
    total: '9 870 €',
    date: '08/03/2024'
  }
];

const tradeHighlights = [
  {
    title: 'Croissance import équipements solaires',
    detail: '+22% sur 12 mois · Principaux marchés : DE, ES, IT'
  },
  {
    title: 'Export cosmétiques bio France',
    detail: '+9% YoY · Top destinations : CA, JP, AE'
  }
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-16">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Tableau de bord</h1>
          <p className="text-slate-600">Suivez vos indicateurs clés, alertes réglementaires et simulations récentes.</p>
        </div>
        <Button>Nouvelle simulation</Button>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-primary/20">
            <CardHeader className="space-y-1">
              <Badge variant="outline" className="w-fit">
                {metric.badge}
              </Badge>
              <CardTitle className="text-base text-slate-500">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-slate-800">{metric.value}</p>
              <p className="text-sm text-green-600">{metric.trend}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Historique des simulations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            {recentSimulations.map((simulation) => (
              <div key={simulation.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{simulation.product}</span>
                  <span className="text-sm text-primary">{simulation.total}</span>
                </div>
                <p className="text-xs text-slate-500">
                  {simulation.route} · {simulation.date} · Ref {simulation.id}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Tendances commerciales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            {tradeHighlights.map((item) => (
              <div key={item.title} className="rounded-lg bg-white p-4 shadow-sm">
                <h3 className="text-base font-semibold text-primary">{item.title}</h3>
                <p className="text-xs text-slate-500">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
