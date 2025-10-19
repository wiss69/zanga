import Link from 'next/link';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select } from '@/src/components/ui/select';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';

const summary = {
  productValue: 12_500,
  freight: 1_250,
  duties: 980,
  vat: 2_520,
  currency: 'EUR'
};

const breakdown = [
  { label: 'Valeur marchandise', value: summary.productValue, color: 'bg-primary' },
  { label: 'Fret & assurance', value: summary.freight, color: 'bg-accent' },
  { label: 'Droits de douane', value: summary.duties, color: 'bg-blue-300' },
  { label: 'TVA', value: summary.vat, color: 'bg-blue-200' }
];

const total = summary.productValue + summary.freight + summary.duties + summary.vat;

export default function SimulatorPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-primary">Simuler mes coûts réels</h1>
        <p className="text-slate-600">
          Calculez en quelques secondes vos coûts d’importation : taux de change ECB, droits de douane TARIC, transport et TVA.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Paramètres logistiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="origin">Pays d&apos;origine</Label>
                <Select id="origin" defaultValue="CN">
                  <option value="CN">Chine</option>
                  <option value="VN">Vietnam</option>
                  <option value="TR">Turquie</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Select id="destination" defaultValue="FR">
                  <option value="FR">France</option>
                  <option value="DE">Allemagne</option>
                  <option value="ES">Espagne</option>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hs-code">Code HS</Label>
                <Input id="hs-code" placeholder="ex. 850760" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <Select id="currency" defaultValue="EUR">
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="value">Valeur marchandise</Label>
                <Input id="value" type="number" placeholder="12 500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transport">Transport</Label>
                <Select id="transport" defaultValue="sea">
                  <option value="sea">Maritime</option>
                  <option value="air">Aérien</option>
                  <option value="rail">Rail</option>
                </Select>
              </div>
            </div>
            <Button className="w-full">Calculer la simulation</Button>
            <p className="text-xs text-slate-400">
              Les taux de change sont mis à jour quotidiennement via la BCE. En cas d’échec, un fallback exchangerate.host est
              utilisé automatiquement.
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Résultats &amp; export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm text-slate-600">
            <div>
              <h3 className="text-lg font-semibold text-primary">Coût total estimé</h3>
              <p className="text-2xl font-bold text-slate-800">{total.toLocaleString('fr-FR')} {summary.currency}</p>
              <p className="text-xs text-slate-400">Incluant frais logistiques et droits importation.</p>
            </div>
            <div className="space-y-3">
              {breakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between">
                    <span>{item.label}</span>
                    <span>{item.value.toLocaleString('fr-FR')} {summary.currency}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${Math.round((item.value / total) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="#">Exporter PDF</Link>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link href="#">Exporter CSV</Link>
              </Button>
            </div>
            <Link href="/api/taric-link?code=850760" className="text-sm text-primary hover:underline">
              Consulter le détail TARIC
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
